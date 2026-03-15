import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { BOOKING_CONFIRMATION_DESCRIPTION, BOOKING_CONFIRMATION_MODE } from './config/bookingMode';
import prisma from './lib/prisma';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import bookingRoutes from './routes/bookings';
import cityRoutes from './routes/cities';
import flightRoutes from './routes/flights';
import { cleanupExpiredBookings } from './services/bookingService';
import { startOutboxWorker } from './services/outboxWorker';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';
const isOutboxWorkerEnabled = process.env.ENABLE_OUTBOX_WORKER === 'true';
const CLEANUP_INTERVAL_MS = 60_000;
const SHUTDOWN_TIMEOUT_MS = 10_000;

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many requests. Please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many authentication attempts. Please wait a moment.' },
});

const cityLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many city search requests. Please slow down.' },
});

let outboxInterval: NodeJS.Timeout | null = null;
let cleanupInterval: NodeJS.Timeout | null = null;
let isShuttingDown = false;

app.use(helmet());
app.use(
  cors({
    origin: isProduction ? process.env.ALLOWED_ORIGINS?.split(',') ?? [] : true,
    credentials: true,
  }),
);
app.use(morgan(isProduction ? 'combined' : 'dev'));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      message: 'Booking API is running',
      db: 'connected',
      bookingConfirmationMode: BOOKING_CONFIRMATION_MODE,
      bookingConfirmationDescription: BOOKING_CONFIRMATION_DESCRIPTION,
    });
  } catch {
    res.status(503).json({
      status: 'error',
      message: 'Database unavailable',
      db: 'disconnected',
      bookingConfirmationMode: BOOKING_CONFIRMATION_MODE,
      bookingConfirmationDescription: BOOKING_CONFIRMATION_DESCRIPTION,
    });
  }
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/flights', generalLimiter, flightRoutes);
app.use('/api/bookings', generalLimiter, bookingRoutes);
app.use('/api/cities', cityLimiter, cityRoutes);

app.use(errorHandler);

const server = app.listen(port, () => {
  console.log(`\nServer is running on http://localhost:${port}`);
  console.log('API endpoints:');
  console.log('   GET  /api/health');
  console.log('   POST /api/auth/register    { email, password, name }');
  console.log('   POST /api/auth/login       { email, password }');
  console.log('   GET  /api/auth/me          [JWT]');
  console.log('   GET  /api/flights?from=...&to=...&date=...');
  console.log('   GET  /api/flights/:id');
  console.log('   POST /api/bookings         { seatId } [JWT]');
  console.log('   POST /api/bookings/:id/confirm     [JWT]');
  console.log('   POST /api/bookings/:id/cancel      [JWT]');
  console.log('   GET  /api/bookings/:id             [JWT]');
  console.log('');

  outboxInterval = isOutboxWorkerEnabled ? startOutboxWorker() : null;
  if (!isOutboxWorkerEnabled) {
    console.log('Outbox worker: disabled (set ENABLE_OUTBOX_WORKER=true to enable)');
  }

  cleanupInterval = setInterval(async () => {
    try {
      await cleanupExpiredBookings();
    } catch (error) {
      console.error('[Cleanup] Error:', error);
    }
  }, CLEANUP_INTERVAL_MS);

  console.log(`Expired bookings cleanup: every ${CLEANUP_INTERVAL_MS / 1000}s`);
});

async function closeServerGracefully() {
  await Promise.race([
    new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        console.log('HTTP server closed');
        resolve();
      });
    }),
    new Promise<void>((_, reject) => {
      setTimeout(() => reject(new Error(`Shutdown timed out after ${SHUTDOWN_TIMEOUT_MS}ms`)), SHUTDOWN_TIMEOUT_MS);
    }),
  ]);
}

async function shutdown(signal: 'SIGTERM' | 'SIGINT') {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);

  if (cleanupInterval) {
    clearInterval(cleanupInterval);
  }

  if (outboxInterval) {
    clearInterval(outboxInterval);
  }

  try {
    await closeServerGracefully();
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Shutdown failed:', error);
    await prisma.$disconnect().catch(() => undefined);
    process.exit(1);
  }
}

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});
