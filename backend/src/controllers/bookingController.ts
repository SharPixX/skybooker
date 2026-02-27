import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { bookSeat, confirmBooking, cancelBooking, getBookingById as getBooking } from '../services/bookingService';
import { CreateBookingBody } from '../schemas';

export async function createBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { seatId } = req.body as CreateBookingBody;
    const userId = req.user!.userId; // From JWT — guaranteed by authenticate middleware

    const booking = await bookSeat(userId, seatId);

    res.status(201).json({
      status: 'ok',
      message: `Seat ${booking.seat.seatNumber} locked for you! You have 15 minutes to complete payment.`,
      data: booking,
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
    const booking = await confirmBooking(req.params.id as string, req.user!.userId);
    res.json({
      status: 'ok',
      message: 'Booking confirmed! Your ticket is ready.',
      data: booking,
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
      data: booking,
    });
  } catch (error) {
    next(error);
  }
}

export async function getBookingById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const booking = await getBooking(req.params.id as string, req.user!.userId);
    res.json({ status: 'ok', data: booking });
  } catch (error) {
    next(error);
  }
}
