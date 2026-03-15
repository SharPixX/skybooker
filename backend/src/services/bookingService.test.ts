import test from 'node:test';
import assert from 'node:assert/strict';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { getBookingById, listBookingsForUser } from './bookingService';

test('getBookingById returns the booking when it belongs to the current user', async () => {
  const originalFindUnique = prisma.booking.findUnique;
  const booking = {
    id: 'booking-1',
    userId: 'user-1',
    status: 'PENDING',
  };

  prisma.booking.findUnique = (async (args: any) => {
    assert.deepEqual(args.where, { id: 'booking-1' });
    assert.ok(args.include);
    return booking;
  }) as unknown as typeof prisma.booking.findUnique;

  try {
    const result = await getBookingById('booking-1', 'user-1');
    assert.equal(result, booking);
  } finally {
    prisma.booking.findUnique = originalFindUnique;
  }
});

test('getBookingById rejects access to another user booking', async () => {
  const originalFindUnique = prisma.booking.findUnique;

  prisma.booking.findUnique = (async () => ({
    id: 'booking-2',
    userId: 'another-user',
    status: 'PENDING',
  })) as unknown as typeof prisma.booking.findUnique;

  try {
    await assert.rejects(
      async () => getBookingById('booking-2', 'user-1'),
      (error: unknown) => error instanceof AppError && error.statusCode === 403,
    );
  } finally {
    prisma.booking.findUnique = originalFindUnique;
  }
});

test('listBookingsForUser queries only the current user and keeps stable ordering', async () => {
  const originalFindMany = prisma.booking.findMany;
  const bookings = [{ id: 'booking-3' }, { id: 'booking-4' }];

  prisma.booking.findMany = (async (args: any) => {
    assert.deepEqual(args.where, { userId: 'user-1' });
    assert.deepEqual(args.orderBy, [{ createdAt: 'desc' }, { id: 'desc' }]);
    assert.ok(args.include);
    return bookings;
  }) as unknown as typeof prisma.booking.findMany;

  try {
    const result = await listBookingsForUser('user-1');
    assert.deepEqual(result, bookings);
  } finally {
    prisma.booking.findMany = originalFindMany;
  }
});
