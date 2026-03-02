/**
 * Seed seats using raw pg client (bypasses Prisma connection issues).
 * Only adds seats for flights that don't have them yet.
 */
const { Client } = require('pg');

const connStr = 'postgresql://postgres:mGnrcay1kdzVW2sh@db.gufcrikrsxxotgdufngg.supabase.co:5432/postgres';

async function run() {
  const client = new Client({ connectionString: connStr, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('✅ Connected to Supabase');

  // Find flights without seats
  const { rows: flights } = await client.query(`
    SELECT f.id, f."flightNumber"
    FROM "Flight" f
    LEFT JOIN "Seat" s ON s."flightId" = f.id
    GROUP BY f.id, f."flightNumber"
    HAVING COUNT(s.id) = 0
    ORDER BY f."flightNumber"
  `);

  console.log(`Found ${flights.length} flights without seats`);

  if (flights.length === 0) {
    console.log('✅ All flights already have seats!');
    await client.end();
    return;
  }

  const seatLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
  const rows = 5;
  const BATCH = 10; // 10 flights × 30 seats = 300 rows per INSERT
  let created = 0;

  for (let i = 0; i < flights.length; i += BATCH) {
    const batch = flights.slice(i, i + BATCH);
    const values = [];
    const params = [];
    let paramIdx = 1;

    for (const flight of batch) {
      for (let row = 1; row <= rows; row++) {
        for (const letter of seatLetters) {
          const seatNumber = `${row}${letter}`;
          const basePrice = flight.flightNumber.startsWith('SU') ? 5500 : 3800;
          const price = basePrice - (row - 1) * 300 + (letter <= 'C' ? 500 : 0);
          values.push(`($${paramIdx++}, $${paramIdx++}, $${paramIdx++}, 'AVAILABLE')`);
          params.push(flight.id, seatNumber, price);
        }
      }
    }

    const sql = `INSERT INTO "Seat" ("flightId", "seatNumber", price, status) VALUES ${values.join(', ')}`;
    await client.query(sql, params);
    created += batch.length;

    if (created % 50 === 0 || i + BATCH >= flights.length) {
      console.log(`  💺 ${created}/${flights.length} flights done (${created * 30} seats)`);
    }
  }

  const { rows: countRows } = await client.query('SELECT count(*) FROM "Seat"');
  console.log(`\n✅ Done! Total seats in DB: ${countRows[0].count}`);
  await client.end();
}

run().catch(e => { console.error('❌', e.message); process.exit(1); });
