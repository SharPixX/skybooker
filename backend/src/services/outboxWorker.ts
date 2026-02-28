import prisma from '../lib/prisma';

interface PaymentPayload {
  bookingId: string;
  userId: string;
  seatId: string;
  flightId: string;
  seatNumber: string;
  amount: string;
  currency: string;
}

/**
 * Transactional Outbox Worker
 *
 * This worker polls the OutboxEvent table for PENDING events
 * and processes them (sends to payment gateway, etc.).
 *
 * WHY Outbox pattern?
 * -------------------
 * Problem: We need to book a seat AND request a payment atomically.
 * If we call the payment gateway directly during booking and it fails,
 * we have an inconsistent state (seat locked, no payment).
 *
 * Solution: Save the "intent" (OutboxEvent) in the SAME database transaction
 * as the booking. A separate worker reads these events and sends them to
 * the payment gateway. If the gateway is down, the worker retries later.
 * This guarantees AT-LEAST-ONCE delivery.
 *
 * Concurrency safety:
 * -------------------
 * Uses SELECT ... FOR UPDATE SKIP LOCKED so multiple worker instances
 * won't pick up the same event. Locked rows are silently skipped.
 *
 * Flow:
 * 1. SELECT PENDING events FOR UPDATE SKIP LOCKED (atomic claim)
 * 2. Mark event as PROCESSING
 * 3. Send to payment gateway (simulated here)
 * 4. On success: mark as COMPLETED, confirm the booking
 * 5. On failure: increment retryCount, back to PENDING or FAILED
 */

const MAX_RETRIES = 3;
const POLL_INTERVAL_MS = 5000; // 5 seconds
const MAX_EVENTS_PER_CYCLE = 10;
const PROCESSING_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes — stuck PROCESSING recovery

/**
 * Simulate a payment gateway call.
 * In production, this would be Stripe, YooKassa, etc.
 * Randomly fails ~20% of the time to demonstrate retry logic.
 */
async function simulatePaymentGateway(_payload: PaymentPayload): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));

  // Simulate random failure (20% chance)
  if (Math.random() < 0.2) {
    return {
      success: false,
      error: 'Payment gateway timeout — retrying...',
    };
  }

  return {
    success: true,
    transactionId: `txn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  };
}

/**
 * Atomically claim a batch of PENDING events using FOR UPDATE SKIP LOCKED.
 * This prevents multiple worker instances from processing the same events.
 * Returns the IDs of claimed events (already marked PROCESSING).
 */
async function claimPendingEvents(): Promise<string[]> {
  const claimedIds = await prisma.$transaction(async (tx) => {
    // SELECT ... FOR UPDATE SKIP LOCKED ensures:
    // - Only ONE worker claims each event
    // - Workers don't block each other (SKIP LOCKED)
    const events = await tx.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM "OutboxEvent"
      WHERE status = 'PENDING'
      ORDER BY "createdAt" ASC
      LIMIT ${MAX_EVENTS_PER_CYCLE}
      FOR UPDATE SKIP LOCKED
    `;

    if (events.length === 0) return [];

    const ids = events.map((e) => e.id);

    // Mark all claimed events as PROCESSING atomically
    await tx.outboxEvent.updateMany({
      where: { id: { in: ids } },
      data: { status: 'PROCESSING' },
    });

    return ids;
  });

  return claimedIds;
}

/**
 * Process a single outbox event.
 */
async function processEvent(eventId: string): Promise<void> {
  const event = await prisma.outboxEvent.findUnique({
    where: { id: eventId },
  });

  if (!event || event.status !== 'PROCESSING') return;

  const payload = event.payload as unknown as PaymentPayload;

  console.log(`[Outbox] Processing event ${event.id} (type: ${event.type})`);
  console.log(`[Outbox] Booking: ${payload.bookingId}, Amount: ${payload.amount} ${payload.currency}`);

  try {
    if (event.type === 'PAYMENT_REQUESTED') {
      const result = await simulatePaymentGateway(payload);

      if (result.success) {
        // Payment succeeded — confirm the booking atomically
        // CRITICAL: Check booking is still PENDING before confirming
        // (it may have been cancelled or expired while payment was processing)
        await prisma.$transaction(async (tx) => {
          const booking = await tx.$queryRaw<Array<{ status: string }>>`
            SELECT status FROM "Booking" WHERE id = ${payload.bookingId} FOR UPDATE
          `;

          if (!booking[0] || booking[0].status !== 'PENDING') {
            // Booking was cancelled/expired — mark event as completed (stale)
            await tx.outboxEvent.update({
              where: { id: eventId },
              data: { status: 'COMPLETED', error: `Booking no longer PENDING (was ${booking[0]?.status || 'missing'}). Payment ignored.` },
            });
            console.log(`[Outbox] ⚠️ Booking ${payload.bookingId} is ${booking[0]?.status || 'missing'} — skipping confirmation`);
            return;
          }

          await tx.outboxEvent.update({
            where: { id: eventId },
            data: { status: 'COMPLETED' },
          });

          await tx.booking.update({
            where: { id: payload.bookingId },
            data: { status: 'CONFIRMED' },
          });

          await tx.seat.update({
            where: { id: payload.seatId },
            data: { status: 'BOOKED' },
          });
        });

        console.log(`[Outbox] ✅ Payment successful! Transaction: ${result.transactionId}`);
        console.log(`[Outbox] ✅ Booking ${payload.bookingId} confirmed`);
      } else {
        throw new Error(result.error || 'Payment failed');
      }
    } else {
      // Unknown event type — fail immediately to avoid stuck PROCESSING
      await prisma.outboxEvent.update({
        where: { id: eventId },
        data: {
          status: 'FAILED',
          error: `Unknown event type: ${event.type}`,
        },
      });
      console.error(`[Outbox] ❌ Unknown event type "${event.type}" — marked as FAILED`);
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Outbox] ❌ Event ${eventId} failed: ${errorMessage}`);

    const nextRetry = event.retryCount + 1;

    if (nextRetry >= MAX_RETRIES) {
      // Max retries exceeded — mark as permanently FAILED
      await prisma.$transaction(async (tx) => {
        await tx.outboxEvent.update({
          where: { id: eventId },
          data: {
            status: 'FAILED',
            retryCount: nextRetry,
            error: `${errorMessage} (max retries exceeded)`,
          },
        });

        // Cancel the booking and release the seat
        await tx.booking.update({
          where: { id: payload.bookingId },
          data: { status: 'FAILED' },
        });

        await tx.seat.update({
          where: { id: payload.seatId },
          data: { status: 'AVAILABLE' },
        });
      });

      console.error(`[Outbox] 💀 Event ${eventId} permanently failed after ${MAX_RETRIES} retries`);
      console.error(`[Outbox] 💀 Booking ${payload.bookingId} cancelled, seat released`);
    } else {
      // Put back to PENDING for retry with incremented retryCount
      await prisma.outboxEvent.update({
        where: { id: eventId },
        data: {
          status: 'PENDING',
          retryCount: nextRetry,
          error: `${errorMessage} (attempt ${nextRetry}/${MAX_RETRIES})`,
        },
      });

      console.log(`[Outbox] 🔄 Event ${eventId} will be retried (attempt ${nextRetry}/${MAX_RETRIES})`);
    }
  }
}

/**
 * Main polling loop — claims PENDING events with FOR UPDATE SKIP LOCKED
 * and processes them sequentially. Safe to run on multiple instances.
 * Returns the interval ID for graceful shutdown.
 */
/**
 * Recovery sweep: reset stuck PROCESSING events back to PENDING.
 * This handles the case where the worker crashes mid-processing.
 * Events stuck in PROCESSING for > PROCESSING_TIMEOUT_MS are recovered.
 */
async function recoverStuckEvents(): Promise<void> {
  const cutoff = new Date(Date.now() - PROCESSING_TIMEOUT_MS);
  const result = await prisma.outboxEvent.updateMany({
    where: {
      status: 'PROCESSING',
      updatedAt: { lt: cutoff },
    },
    data: {
      status: 'PENDING',
      error: 'Recovered from stuck PROCESSING state (worker crash/timeout)',
    },
  });
  if (result.count > 0) {
    console.log(`[Outbox] 🔧 Recovered ${result.count} stuck PROCESSING event(s)`);
  }
}

export function startOutboxWorker(): ReturnType<typeof setInterval> {
  console.log(`[Outbox] Worker started. Polling every ${POLL_INTERVAL_MS / 1000}s...`);

  // Run recovery on startup for any events stuck from a previous crash
  recoverStuckEvents().catch((err) => console.error('[Outbox] Recovery error:', err));

  return setInterval(async () => {
    try {
      // Periodically recover stuck events
      await recoverStuckEvents();

      const claimedIds = await claimPendingEvents();

      if (claimedIds.length > 0) {
        console.log(`[Outbox] Claimed ${claimedIds.length} pending event(s)`);
      }

      for (const eventId of claimedIds) {
        await processEvent(eventId);
      }
    } catch (error) {
      console.error('[Outbox] Worker error:', error);
    }
  }, POLL_INTERVAL_MS);
}
