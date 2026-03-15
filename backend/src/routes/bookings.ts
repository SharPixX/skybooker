import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';
import { createBookingSchema, bookingIdParamSchema } from '../schemas';
import { createBooking, confirm, cancel, getBookingById, listMine } from '../controllers/bookingController';

const router = Router();

const bookingMutationLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many booking attempts. Please wait a moment.' },
});

router.use(authenticate);

router.post('/', bookingMutationLimiter, validate(createBookingSchema, 'body'), createBooking);
router.post('/:id/confirm', bookingMutationLimiter, validate(bookingIdParamSchema, 'params'), confirm);
router.post('/:id/cancel', bookingMutationLimiter, validate(bookingIdParamSchema, 'params'), cancel);

router.get('/', listMine);
router.get('/:id', validate(bookingIdParamSchema, 'params'), getBookingById);

export default router;
