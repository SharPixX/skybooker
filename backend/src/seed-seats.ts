import dotenv from 'dotenv';
dotenv.config();

import { randomUUID } from 'crypto';
const { Client } = require('pg') as { Client: new (config: { connectionString: string; ssl: { rejectUnauthorized: boolean } }) => any };

type Primitive = string | number | Date | boolean | null;

interface FlightWithoutSeats {
  id: string;
  departureCode: string;
  destinationCode: string;
}

const INSERT_BATCH_SIZE = 64;
const PAUSE_BETWEEN_FLIGHTS_MS = 120;

function getDatabaseUrl(): string {
  const value = process.env.DATABASE_URL;
  if (!value) {
    throw new Error('DATABASE_URL is not configured');
  }
  return value;
}

async function runQuery<T = unknown>(text: string, values: Primitive[] = []): Promise<T[]> {
  const url = getDatabaseUrl();

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const client = new Client({
      connectionString: url,
      ssl: { rejectUnauthorized: false },
    });

    client.on('error', () => {});

    try {
      await client.connect();
      const result = await client.query(text, values);
      await client.end();
      return result.rows as T[];
    } catch (error) {
      await client.end().catch(() => {});

      if (attempt === 3) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, 900 * attempt));
    }
  }

  return [];
}

async function insertRows(table: string, columns: string[], rows: Primitive[][], batchSize: number) {
  for (let start = 0; start < rows.length; start += batchSize) {
    const batch = rows.slice(start, start + batchSize);
    const values: Primitive[] = [];

    const placeholders = batch.map((row, rowIndex) => {
      const rowPlaceholders = row.map((_value, columnIndex) => {
        values.push(row[columnIndex]);
        return `$${rowIndex * columns.length + columnIndex + 1}`;
      });

      return `(${rowPlaceholders.join(', ')})`;
    });

    await runQuery(
      `INSERT INTO "${table}" (${columns.map((column) => `"${column}"`).join(', ')}) VALUES ${placeholders.join(', ')}`,
      values,
    );
  }
}

function seatStatusFor(row: number, letter: string): 'AVAILABLE' | 'LOCKED' | 'BOOKED' {
  if ((row === 2 && letter === 'A') || (row === 8 && letter === 'F') || (row === 19 && letter === 'C')) {
    return 'BOOKED';
  }

  if ((row === 11 && letter === 'A') || (row === 12 && letter === 'F')) {
    return 'LOCKED';
  }

  return 'AVAILABLE';
}

function getPricing(from: string, to: string) {
  const routeKey = `${from}-${to}`;

  switch (routeKey) {
    case 'SVO-DXB':
    case 'DXB-SVO':
      return { economyBase: 14500, businessBase: 45900 };
    case 'VKO-AYT':
    case 'AYT-VKO':
      return { economyBase: 12800, businessBase: 36900 };
    case 'SVO-OVB':
    case 'OVB-SVO':
      return { economyBase: 9800, businessBase: 28400 };
    case 'SVO-SVX':
    case 'SVX-SVO':
      return { economyBase: 7200, businessBase: 20400 };
    case 'DME-LED':
    case 'LED-DME':
      return { economyBase: 7800, businessBase: 18600 };
    case 'LED-AER':
    case 'AER-LED':
      return { economyBase: 6900, businessBase: 21400 };
    case 'DME-KZN':
    case 'KZN-DME':
      return { economyBase: 5400, businessBase: 17400 };
    default:
      return { economyBase: 6490, businessBase: 22900 };
  }
}

function buildSeatRows(flightId: string, from: string, to: string) {
  const now = new Date();
  const pricing = getPricing(from, to);
  const rows: Primitive[][] = [];

  for (let row = 1; row <= 4; row += 1) {
    for (const letter of ['A', 'C', 'D', 'F']) {
      const windowBonus = letter === 'A' || letter === 'F' ? 400 : 0;
      const rowDiscount = (row - 1) * 450;

      rows.push([
        randomUUID(),
        flightId,
        `${row}${letter}`,
        'business',
        row,
        letter,
        seatStatusFor(row, letter),
        pricing.businessBase + windowBonus - rowDiscount,
        1,
        now,
        now,
      ]);
    }
  }

  for (let row = 5; row <= 30; row += 1) {
    for (const letter of ['A', 'B', 'C', 'D', 'E', 'F']) {
      const windowBonus = letter === 'A' || letter === 'F' ? 350 : 0;
      const exitBonus = row === 12 || row === 25 ? 950 : 0;
      const rowDiscount = Math.floor((row - 5) / 5) * 180;

      rows.push([
        randomUUID(),
        flightId,
        `${row}${letter}`,
        'economy',
        row,
        letter,
        seatStatusFor(row, letter),
        pricing.economyBase + windowBonus + exitBonus - rowDiscount,
        1,
        now,
        now,
      ]);
    }
  }

  return rows;
}

async function seedSeats() {
  console.log('Seeding seats for flights without seats...');

  const flightsWithoutSeats = await runQuery<FlightWithoutSeats>(`
    SELECT
      f.id,
      dep.code AS "departureCode",
      dest.code AS "destinationCode"
    FROM "Flight" f
    JOIN "Airport" dep ON dep.id = f."departureAirportId"
    JOIN "Airport" dest ON dest.id = f."destinationAirportId"
    LEFT JOIN "Seat" s ON s."flightId" = f.id
    GROUP BY f.id, dep.code, dest.code
    HAVING COUNT(s.id) = 0
    ORDER BY f."departureTime" ASC
  `);

  console.log(`Flights without seats: ${flightsWithoutSeats.length}`);

  if (flightsWithoutSeats.length === 0) {
    console.log('All flights already have seats.');
    return;
  }

  for (let index = 0; index < flightsWithoutSeats.length; index += 1) {
    const flight = flightsWithoutSeats[index];
    const seatRows = buildSeatRows(flight.id, flight.departureCode, flight.destinationCode);

    await insertRows(
      'Seat',
      ['id', 'flightId', 'seatNumber', 'class', 'row', 'letter', 'status', 'price', 'version', 'createdAt', 'updatedAt'],
      seatRows,
      INSERT_BATCH_SIZE,
    );

    if ((index + 1) % 10 === 0 || index + 1 === flightsWithoutSeats.length) {
      console.log(`Seeded seats for ${index + 1}/${flightsWithoutSeats.length} flights`);
    }

    await new Promise((resolve) => setTimeout(resolve, PAUSE_BETWEEN_FLIGHTS_MS));
  }

  const totalSeats = await runQuery<{ count: string }>('SELECT COUNT(*)::text AS count FROM "Seat"');
  console.log(`Done. Total seats in DB: ${totalSeats[0]?.count ?? '0'}`);
}

seedSeats().catch((error) => {
  console.error('Seat seeding failed:', error);
  process.exit(1);
});
