import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';
import { createBookingSchema, bookingIdParamSchema } from '../schemas';
import { createBooking, confirm, cancel, getBookingById } from '../controllers/bookingController';

const router = Router();

// Strict rate limit for booking mutations: 10 per minute per IP
const bookingMutationLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many booking attempts. Please wait a moment.' },
});

// All booking routes require authentication
router.use(authenticate);

// Mutation routes — strict rate limit
router.post('/', bookingMutationLimiter, validate(createBookingSchema, 'body'), createBooking);
router.post('/:id/confirm', bookingMutationLimiter, validate(bookingIdParamSchema, 'params'), confirm);
router.post('/:id/cancel', bookingMutationLimiter, validate(bookingIdParamSchema, 'params'), cancel);

// Read routes — no strict limiter (uses general limiter from app level)
router.get('/:id', validate(bookingIdParamSchema, 'params'), getBookingById);

export default router;
