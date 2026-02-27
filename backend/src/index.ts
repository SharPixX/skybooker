import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import prisma from './lib/prisma';
import flightRoutes from './routes/flights';
import bookingRoutes from './routes/bookings';
import cityRoutes from './routes/cities';
import authRoutes from './routes/auth';
import { errorHandler } from './middleware/errorHandler';
import { startOutboxWorker } from './services/outboxWorker';
import { cleanupExpiredBookings } from './services/bookingService';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// ── Security ─────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: isProduction
    ? process.env.ALLOWED_ORIGINS?.split(',') ?? []
    : true, // Allow all origins in development
  credentials: true,
}));

// ── Request logging ──────────────────────────────────────
app.use(morgan(isProduction ? 'combined' : 'dev'));

// ── Body parsing ─────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));

// ── Rate limiting ────────────────────────────────────────
// General rate limit: 100 requests per 15 minutes per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many requests. Please try again later.' },
});

// Strict rate limit for booking mutations: 10 per minute per IP
const bookingLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many booking attempts. Please wait a moment.' },
});

// ── Routes ───────────────────────────────────────────────
app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', message: 'Booking API is running 🚀', db: 'connected' });
  } catch {
    res.status(503).json({ status: 'error', message: 'Database unavailable', db: 'disconnected' });
  }
});

app.use('/api/auth', generalLimiter, authRoutes);
app.use('/api/flights', generalLimiter, flightRoutes);
app.use('/api/bookings', bookingLimiter, bookingRoutes);
app.use('/api/cities', generalLimiter, cityRoutes);

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(`\n🚀 Server is running on http://localhost:${port}`);
  console.log(`📋 API endpoints:`);
  console.log(`   GET  /api/health`);
  console.log(`   POST /api/auth/register    { email, password, name }`);
  console.log(`   POST /api/auth/login       { email, password }`);
  console.log(`   GET  /api/auth/me          [JWT]`);
  console.log(`   GET  /api/flights?from=...&to=...&date=...`);
  console.log(`   GET  /api/flights/:id`);
  console.log(`   POST /api/bookings         { seatId } [JWT]`);
  console.log(`   POST /api/bookings/:id/confirm     [JWT]`);
  console.log(`   POST /api/bookings/:id/cancel      [JWT]`);
  console.log(`   GET  /api/bookings/:id             [JWT]`);
  console.log('');

  // Start the Outbox Worker (processes payment events)
  const outboxInterval = startOutboxWorker();

  // Start expired bookings cleanup (every 60 seconds)
  const CLEANUP_INTERVAL_MS = 60_000;
  const cleanupInterval = setInterval(async () => {
    try {
      await cleanupExpiredBookings();
    } catch (error) {
      console.error('[Cleanup] Error:', error);
    }
  }, CLEANUP_INTERVAL_MS);

  console.log(`⏰ Expired bookings cleanup: every ${CLEANUP_INTERVAL_MS / 1000}s`);

  // Graceful shutdown
  const shutdown = async () => {
    console.log('\n🛑 Shutting down gracefully...');
    clearInterval(cleanupInterval);
    clearInterval(outboxInterval);
    await prisma.$disconnect();
    process.exit(0);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
});

