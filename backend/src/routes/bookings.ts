import { Router } from 'express';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';
import { createBookingSchema, bookingIdParamSchema } from '../schemas';
import { createBooking, confirm, cancel, getBookingById } from '../controllers/bookingController';

const router = Router();

// All booking routes require authentication
router.use(authenticate);

router.post('/', validate(createBookingSchema, 'body'), createBooking);
router.post('/:id/confirm', validate(bookingIdParamSchema, 'params'), confirm);
router.post('/:id/cancel', validate(bookingIdParamSchema, 'params'), cancel);
router.get('/:id', validate(bookingIdParamSchema, 'params'), getBookingById);

export default router;
