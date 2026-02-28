import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { Prisma } from '@prisma/client';

const BOOKING_TIMEOUT_MINUTES = 15;

/** Reusable include for booking queries — keeps responses consistent */
const BOOKING_INCLUDE = {
  seat: {
    include: {
      flight: {
        include: { departureAirport: true, destinationAirport: true },
      },
    },
  },
} satisfies Prisma.BookingInclude;

/**
 * Book a seat using PESSIMISTIC LOCKING (SELECT ... FOR UPDATE).
 *
 * This is the core of the project — it solves the "lost update" problem.
 * Two users selecting the same seat at the same time will NOT cause a
 * double booking because the database row is locked during the transaction.
 *
 * Flow:
 * 1. BEGIN TRANSACTION
 * 2. SELECT seat FOR UPDATE (lock the row — other transactions will WAIT here)
 * 3. Check if the seat is AVAILABLE
 * 4. Update seat status to LOCKED
 * 5. Create a Booking record (status: PENDING)
 * 6. Create an OutboxEvent (PAYMENT_REQUESTED) — Transactional Outbox pattern
 * 7. COMMIT TRANSACTION
 *
 * If another user tries to book the same seat concurrently:
 * - Their SELECT FOR UPDATE will BLOCK until this transaction commits
 * - After unblocking, they will see status = LOCKED and get an error
 */
export async function bookSeat(userId: string, seatId: string) {
  return prisma.$transaction(async (tx) => {
    // Step 1: Lock the seat row with SELECT ... FOR UPDATE
    // This is the KEY to solving race conditions!
    // Any concurrent transaction trying to read this row will WAIT until we commit.
    const seats = await tx.$queryRaw<
      Array<{
        id: string;
        flightId: string;
        seatNumber: string;
        status: string;
        price: Prisma.Decimal;
        version: number;
      }>
    >`
      SELECT id, "flightId", "seatNumber", status, price, version
      FROM "Seat"
      WHERE id = ${seatId}
      FOR UPDATE
    `;

    const seat = seats[0];

    if (!seat) {
      throw new AppError('Seat not found', 404);
    }

    // Step 2: Check if seat is available
    // If another user already locked/booked it, this will fail gracefully
    if (seat.status !== 'AVAILABLE') {
      throw new AppError(
        `Seat ${seat.seatNumber} is already ${seat.status.toLowerCase()}. Please choose another seat.`,
        409 // Conflict
      );
    }

    // Step 3: Lock the seat (mark as LOCKED, not BOOKED yet — waiting for payment)
    await tx.seat.update({
      where: { id: seatId },
      data: {
        status: 'LOCKED',
        version: { increment: 1 },
      },
    });

    // Step 4: Create the booking record
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + BOOKING_TIMEOUT_MINUTES);

    const booking = await tx.booking.create({
      data: {
        userId,
        seatId,
        status: 'PENDING',
        expiresAt,
      },
      include: BOOKING_INCLUDE,
    });

    // Step 5: Create an OutboxEvent for the payment processor (Transactional Outbox pattern)
    // This event is saved in the SAME transaction as the booking.
    // A separate worker will pick it up and send it to the payment gateway.
    // Even if the payment gateway is down, the event is safely stored in the DB.
    await tx.outboxEvent.create({
      data: {
        type: 'PAYMENT_REQUESTED',
        payload: {
          bookingId: booking.id,
          userId,
          seatId,
          flightId: seat.flightId,
          seatNumber: seat.seatNumber,
          amount: seat.price.toString(),
          currency: 'RUB',
        },
      },
    });

    return booking;
  }, {
    // ReadCommitted + SELECT FOR UPDATE provides sufficient protection.
    // The row-level lock prevents double bookings without the overhead
    // of Serializable isolation (which can cause false serialization failures).
    timeout: 10000, // 10 seconds max
  });
}

/**
 * Confirm a booking after successful payment.
 * Changes seat status from LOCKED to BOOKED and booking status to CONFIRMED.
 * Only the booking owner can confirm.
 */
export async function confirmBooking(bookingId: string, requestUserId: string) {
  return prisma.$transaction(async (tx) => {
    // Pessimistic lock: SELECT FOR UPDATE prevents race conditions
    // between concurrent confirm/cancel/outbox-worker operations
    const bookings = await tx.$queryRaw<Array<{ id: string; userId: string; seatId: string; status: string; expiresAt: Date }>>`
      SELECT id, "userId", "seatId", status, "expiresAt" FROM "Booking"
      WHERE id = ${bookingId}
      FOR UPDATE
    `;
    const booking = bookings[0] || null;

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    // Ownership check — prevent users from confirming other people's bookings
    if (booking.userId !== requestUserId) {
      throw new AppError('Access denied. This booking belongs to another user.', 403);
    }

    if (booking.status !== 'PENDING') {
      throw new AppError(`Booking is already ${booking.status.toLowerCase()}`, 400);
    }

    if (new Date() > booking.expiresAt) {
      // Booking expired — release the seat
      await tx.seat.update({
        where: { id: booking.seatId },
        data: { status: 'AVAILABLE' },
      });
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'CANCELLED' },
      });
      throw new AppError('Booking expired. The seat has been released.', 410);
    }

    // Confirm the booking
    const updatedBooking = await tx.booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED' },
      include: BOOKING_INCLUDE,
    });

    // Mark seat as BOOKED
    await tx.seat.update({
      where: { id: booking.seatId },
      data: { status: 'BOOKED' },
    });

    return updatedBooking;
  });
}

/**
 * Cancel a booking — release the seat back to AVAILABLE.
 * Only the booking owner can cancel.
 */
export async function cancelBooking(bookingId: string, requestUserId: string) {
  return prisma.$transaction(async (tx) => {
    // Pessimistic lock: SELECT FOR UPDATE prevents race with outbox worker
    const bookings = await tx.$queryRaw<Array<{ id: string; userId: string; seatId: string; status: string }>>`
      SELECT id, "userId", "seatId", status FROM "Booking"
      WHERE id = ${bookingId}
      FOR UPDATE
    `;
    const booking = bookings[0] || null;

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    // Ownership check
    if (booking.userId !== requestUserId) {
      throw new AppError('Access denied. This booking belongs to another user.', 403);
    }

    // Only PENDING bookings can be cancelled (CONFIRMED requires refund flow)
    if (booking.status !== 'PENDING') {
      throw new AppError(
        booking.status === 'CANCELLED'
          ? 'Booking is already cancelled'
          : `Cannot cancel a ${booking.status.toLowerCase()} booking`,
        400
      );
    }

    // Release the seat
    await tx.seat.update({
      where: { id: booking.seatId },
      data: { status: 'AVAILABLE' },
    });

    const updatedBooking = await tx.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' },
      include: BOOKING_INCLUDE,
    });

    return updatedBooking;
  });
}

/**
 * Get a booking by ID with full flight/seat details.
 * Only the booking owner can view.
 */
export async function getBookingById(bookingId: string, requestUserId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: BOOKING_INCLUDE,
  });

  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  // Ownership check
  if (booking.userId !== requestUserId) {
    throw new AppError('Access denied. This booking belongs to another user.', 403);
  }

  return booking;
}

/**
 * Clean up expired bookings using batch operations.
 *
 * Uses a single transaction with raw SQL to atomically:
 * 1. Find all expired PENDING bookings
 * 2. Release their seats back to AVAILABLE
 * 3. Mark the bookings as CANCELLED
 *
 * This avoids the N+1 problem of updating bookings one-by-one.
 */
export async function cleanupExpiredBookings(): Promise<number> {
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    // Step 1: Find expired pending bookings and lock them
    const expiredBookings = await tx.$queryRaw<Array<{ id: string; seatId: string }>>`
      SELECT id, "seatId" FROM "Booking"
      WHERE status = 'PENDING' AND "expiresAt" < ${now}
      FOR UPDATE SKIP LOCKED
    `;

    if (expiredBookings.length === 0) return 0;

    const bookingIds = expiredBookings.map((b) => b.id);
    const seatIds = expiredBookings.map((b) => b.seatId);

    // Step 2: Batch-release all seats
    await tx.seat.updateMany({
      where: { id: { in: seatIds } },
      data: { status: 'AVAILABLE' },
    });

    // Step 3: Batch-cancel all bookings
    await tx.booking.updateMany({
      where: { id: { in: bookingIds } },
      data: { status: 'CANCELLED' },
    });

    console.log(`[Cleanup] Released ${expiredBookings.length} expired booking(s) in a single batch`);
    return expiredBookings.length;
  });
}
