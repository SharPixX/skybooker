import dotenv from 'dotenv';
dotenv.config();

import prisma from './lib/prisma';

/**
 * Seed ONLY seats for flights that don't have them yet.
 * Handles connection drops by working in small batches with reconnection.
 */
async function seedSeats() {
  console.log('💺 Seeding seats for flights without seats...');

  // Get flights that have NO seats
  const flightsWithoutSeats = await prisma.$queryRaw<Array<{ id: string; flightNumber: string }>>`
    SELECT f.id, f."flightNumber"
    FROM "Flight" f
    LEFT JOIN "Seat" s ON s."flightId" = f.id
    GROUP BY f.id, f."flightNumber"
    HAVING COUNT(s.id) = 0
    ORDER BY f."flightNumber"
  `;

  console.log(`Found ${flightsWithoutSeats.length} flights without seats`);

  if (flightsWithoutSeats.length === 0) {
    console.log('✅ All flights already have seats!');
    return;
  }

  const seatLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
  const rows = 5;
  const BATCH = 5; // 5 flights × 30 seats = 150 rows per insert (small!)
  let created = 0;

  for (let i = 0; i < flightsWithoutSeats.length; i += BATCH) {
    const batch = flightsWithoutSeats.slice(i, i + BATCH);
    const seats: Array<{
      flightId: string;
      seatNumber: string;
      price: number;
      status: 'AVAILABLE';
    }> = [];

    for (const flight of batch) {
      for (let row = 1; row <= rows; row++) {
        for (const letter of seatLetters) {
          const seatNumber = `${row}${letter}`;
          const basePrice = flight.flightNumber.startsWith('SU') ? 5500 : 3800;
          const price = basePrice - (row - 1) * 300 + (letter <= 'C' ? 500 : 0);
          seats.push({
            flightId: flight.id,
            seatNumber,
            price,
            status: 'AVAILABLE' as const,
          });
        }
      }
    }

    try {
      await prisma.seat.createMany({ data: seats });
      created += batch.length;
      if (created % 50 === 0 || created >= flightsWithoutSeats.length) {
        console.log(`  💺 ${created}/${flightsWithoutSeats.length} flights done (${created * 30} seats)`);
      }
    } catch (err: any) {
      console.error(`  ❌ Error at flight ${i}: ${err.message}`);
      console.log('  Reconnecting and retrying...');
      await prisma.$disconnect();
      await new Promise((r) => setTimeout(r, 2000));
      // Retry this batch
      try {
        await prisma.seat.createMany({ data: seats });
        created += batch.length;
        console.log(`  ✅ Retry succeeded at flight ${i}`);
      } catch (err2: any) {
        console.error(`  ❌ Retry also failed: ${err2.message}`);
        console.log(`  Skipping batch at index ${i}, re-run script to continue`);
      }
    }

    // Small delay to avoid overwhelming the connection
    if (i % 50 === 0 && i > 0) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  const totalSeats = await prisma.seat.count();
  console.log(`\n✅ Done! Total seats in DB: ${totalSeats}`);
}

seedSeats()
  .catch((e) => {
    console.error('❌ Failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
