import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { BOOKING_CONFIRMATION_MODE, IS_MANUAL_CONFIRMATION_ENABLED } from '../config/bookingMode';
import {
  bookSeat,
  confirmBooking,
  cancelBooking,
  getBookingById as getBooking,
  listBookingsForUser,
} from '../services/bookingService';
import { CreateBookingBody } from '../schemas';

function withConfirmationMode<T>(booking: T) {
  return {
    ...booking,
    confirmationMode: BOOKING_CONFIRMATION_MODE,
  };
}

export async function createBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { seatId } = req.body as CreateBookingBody;
    const userId = req.user!.userId; // From JWT — guaranteed by authenticate middleware

    const booking = await bookSeat(userId, seatId);

    res.status(201).json({
      status: 'ok',
      message: `Seat ${booking.seat.seatNumber} locked for you! You have 15 minutes to complete payment.`,
      data: withConfirmationMode(booking),
    });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && (error.code === 'P2010' || error.code === 'P2034')) {
      res.status(409).json({
        status: 'error',
        message: 'This seat is being booked by another user right now. Please try again or choose a different seat.',
      });
      return;
    }
    next(error);
  }
}

export async function confirm(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!IS_MANUAL_CONFIRMATION_ENABLED) {
      res.status(409).json({
        status: 'error',
        message: 'Booking confirmation is disabled in this build until a payment provider is connected.',
        data: {
          mode: BOOKING_CONFIRMATION_MODE,
        },
      });
      return;
    }

    const booking = await confirmBooking(req.params.id as string, req.user!.userId);
    res.json({
      status: 'ok',
      message: 'Booking manually confirmed for demo purposes. Your ticket is ready.',
      data: withConfirmationMode(booking),
    });
  } catch (error) {
    next(error);
  }
}

export async function cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const booking = await cancelBooking(req.params.id as string, req.user!.userId);
    res.json({
      status: 'ok',
      message: 'Booking cancelled. Seat is now available.',
      data: withConfirmationMode(booking),
    });
  } catch (error) {
    next(error);
  }
}

export async function getBookingById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const booking = await getBooking(req.params.id as string, req.user!.userId);
    res.json({ status: 'ok', data: withConfirmationMode(booking) });
  } catch (error) {
    next(error);
  }
}

export async function listMine(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const bookings = await listBookingsForUser(req.user!.userId);
    res.json({ status: 'ok', data: bookings.map((booking) => withConfirmationMode(booking)) });
  } catch (error) {
    next(error);
  }
}
