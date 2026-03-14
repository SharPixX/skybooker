import dotenv from 'dotenv';
dotenv.config();

import { randomUUID } from 'crypto';
const { Client } = require('pg') as { Client: new (config: { connectionString: string; ssl: { rejectUnauthorized: boolean } }) => any };

type Primitive = string | number | Date | boolean | null;

interface AirportSeed {
  code: string;
  city: string;
  name: string;
  country: string;
}

interface RouteSeed {
  from: string;
  to: string;
  departures: string[];
  durationMinutes: number;
  economyBase: number;
  businessBase: number;
}

interface FlightSeedRow {
  id: string;
  flightNumber: string;
  aircraftType: string;
  departureAirportId: string;
  destinationAirportId: string;
  departureTime: Date;
  arrivalTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface SeatSeedRow {
  id: string;
  flightId: string;
  seatNumber: string;
  class: 'economy' | 'business';
  row: number;
  letter: string;
  status: 'AVAILABLE' | 'LOCKED' | 'BOOKED';
  price: number;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const AIRPORTS: AirportSeed[] = [
  { code: 'SVO', city: 'Москва', name: 'Шереметьево', country: 'Россия' },
  { code: 'DME', city: 'Москва', name: 'Домодедово', country: 'Россия' },
  { code: 'VKO', city: 'Москва', name: 'Внуково', country: 'Россия' },
  { code: 'LED', city: 'Санкт-Петербург', name: 'Пулково', country: 'Россия' },
  { code: 'AER', city: 'Сочи', name: 'Адлер', country: 'Россия' },
  { code: 'KZN', city: 'Казань', name: 'Казань', country: 'Россия' },
  { code: 'SVX', city: 'Екатеринбург', name: 'Кольцово', country: 'Россия' },
  { code: 'OVB', city: 'Новосибирск', name: 'Толмачево', country: 'Россия' },
  { code: 'AYT', city: 'Анталья', name: 'Анталья', country: 'Турция' },
  { code: 'DXB', city: 'Дубай', name: 'Дубай', country: 'ОАЭ' },
];

const ROUTES: RouteSeed[] = [
  {
    from: 'SVO',
    to: 'AER',
    departures: ['06:40', '12:25', '19:55'],
    durationMinutes: 235,
    economyBase: 6490,
    businessBase: 22900,
  },
  {
    from: 'AER',
    to: 'SVO',
    departures: ['08:50', '15:20', '22:10'],
    durationMinutes: 235,
    economyBase: 6490,
    businessBase: 22900,
  },
  {
    from: 'SVO',
    to: 'DXB',
    departures: ['09:15'],
    durationMinutes: 330,
    economyBase: 14500,
    businessBase: 45900,
  },
  {
    from: 'DXB',
    to: 'SVO',
    departures: ['16:20'],
    durationMinutes: 330,
    economyBase: 14500,
    businessBase: 45900,
  },
  {
    from: 'DME',
    to: 'KZN',
    departures: ['07:05', '18:10'],
    durationMinutes: 95,
    economyBase: 5400,
    businessBase: 17400,
  },
  {
    from: 'KZN',
    to: 'DME',
    departures: ['09:40', '20:40'],
    durationMinutes: 95,
    economyBase: 5400,
    businessBase: 17400,
  },
  {
    from: 'DME',
    to: 'LED',
    departures: ['08:00', '14:15', '20:35'],
    durationMinutes: 90,
    economyBase: 7800,
    businessBase: 18600,
  },
  {
    from: 'LED',
    to: 'DME',
    departures: ['09:50', '16:10', '22:25'],
    durationMinutes: 90,
    economyBase: 7800,
    businessBase: 18600,
  },
  {
    from: 'VKO',
    to: 'AYT',
    departures: ['10:30'],
    durationMinutes: 290,
    economyBase: 12800,
    businessBase: 36900,
  },
  {
    from: 'AYT',
    to: 'VKO',
    departures: ['18:20'],
    durationMinutes: 290,
    economyBase: 12800,
    businessBase: 36900,
  },
  {
    from: 'LED',
    to: 'AER',
    departures: ['07:40'],
    durationMinutes: 260,
    economyBase: 6900,
    businessBase: 21400,
  },
  {
    from: 'AER',
    to: 'LED',
    departures: ['19:10'],
    durationMinutes: 260,
    economyBase: 6900,
    businessBase: 21400,
  },
  {
    from: 'SVO',
    to: 'SVX',
    departures: ['08:30', '17:50'],
    durationMinutes: 155,
    economyBase: 7200,
    businessBase: 20400,
  },
  {
    from: 'SVX',
    to: 'SVO',
    departures: ['12:40', '21:35'],
    durationMinutes: 155,
    economyBase: 7200,
    businessBase: 20400,
  },
  {
    from: 'SVO',
    to: 'OVB',
    departures: ['23:15'],
    durationMinutes: 250,
    economyBase: 9800,
    businessBase: 28400,
  },
  {
    from: 'OVB',
    to: 'SVO',
    departures: ['06:10'],
    durationMinutes: 250,
    economyBase: 9800,
    businessBase: 28400,
  },
];

const FLIGHT_HORIZON_DAYS = 10;
const AIRCRAFT_TYPE = 'Boeing 737-800';
const FLIGHT_BATCH_SIZE = 8;
const SEAT_BATCH_SIZE = 60;

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

      await new Promise((resolve) => setTimeout(resolve, 800 * attempt));
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

    console.log(`Inserted ${Math.min(start + batch.length, rows.length)}/${rows.length} rows into ${table}`);
  }
}

function startOfTodayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
}

function buildUtcDate(dayOffset: number, time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);
  const date = startOfTodayUtc();
  date.setUTCDate(date.getUTCDate() + dayOffset);
  date.setUTCHours(hours, minutes, 0, 0);
  return date;
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

function generateSeats(flightId: string, economyBase: number, businessBase: number, createdAt: Date): SeatSeedRow[] {
  const seats: SeatSeedRow[] = [];

  for (let row = 1; row <= 4; row += 1) {
    for (const letter of ['A', 'C', 'D', 'F']) {
      const windowBonus = letter === 'A' || letter === 'F' ? 400 : 0;
      const rowDiscount = (row - 1) * 450;

      seats.push({
        id: randomUUID(),
        flightId,
        seatNumber: `${row}${letter}`,
        class: 'business',
        row,
        letter,
        status: seatStatusFor(row, letter),
        price: businessBase + windowBonus - rowDiscount,
        version: 1,
        createdAt,
        updatedAt: createdAt,
      });
    }
  }

  for (let row = 5; row <= 30; row += 1) {
    for (const letter of ['A', 'B', 'C', 'D', 'E', 'F']) {
      const windowBonus = letter === 'A' || letter === 'F' ? 350 : 0;
      const exitBonus = row === 12 || row === 25 ? 950 : 0;
      const rowDiscount = Math.floor((row - 5) / 5) * 180;

      seats.push({
        id: randomUUID(),
        flightId,
        seatNumber: `${row}${letter}`,
        class: 'economy',
        row,
        letter,
        status: seatStatusFor(row, letter),
        price: economyBase + windowBonus + exitBonus - rowDiscount,
        version: 1,
        createdAt,
        updatedAt: createdAt,
      });
    }
  }

  return seats;
}

async function clearExistingData() {
  console.log('Clearing existing airline data...');
  await runQuery('DELETE FROM "OutboxEvent"');
  await runQuery('DELETE FROM "Booking"');
  await runQuery('DELETE FROM "Seat"');
  await runQuery('DELETE FROM "Flight"');
  await runQuery('DELETE FROM "Airport"');
}

async function main() {
  console.log('Bootstrapping remote database with airline data...');

  await clearExistingData();

  const airportIdByCode = new Map<string, string>();
  const now = new Date();

  const airportRows = AIRPORTS.map((airport) => {
    const id = randomUUID();
    airportIdByCode.set(airport.code, id);

    return [
      id,
      airport.code,
      airport.name,
      airport.city,
      airport.country,
      now,
      now,
    ] satisfies Primitive[];
  });

  await insertRows(
    'Airport',
    ['id', 'code', 'name', 'city', 'country', 'createdAt', 'updatedAt'],
    airportRows,
    AIRPORTS.length,
  );

  const flights: FlightSeedRow[] = [];
  let flightCounter = 1001;

  for (let dayOffset = 0; dayOffset < FLIGHT_HORIZON_DAYS; dayOffset += 1) {
    for (const route of ROUTES) {
      for (const departureTime of route.departures) {
        const departure = buildUtcDate(dayOffset, departureTime);
        const arrival = new Date(departure.getTime() + route.durationMinutes * 60 * 1000);

        flights.push({
          id: randomUUID(),
          flightNumber: `YA-${flightCounter}`,
          aircraftType: AIRCRAFT_TYPE,
          departureAirportId: airportIdByCode.get(route.from)!,
          destinationAirportId: airportIdByCode.get(route.to)!,
          departureTime: departure,
          arrivalTime: arrival,
          createdAt: now,
          updatedAt: now,
        });

        flightCounter += 1;
      }
    }
  }

  await insertRows(
    'Flight',
    ['id', 'flightNumber', 'aircraftType', 'departureAirportId', 'destinationAirportId', 'departureTime', 'arrivalTime', 'createdAt', 'updatedAt'],
    flights.map((flight) => [
      flight.id,
      flight.flightNumber,
      flight.aircraftType,
      flight.departureAirportId,
      flight.destinationAirportId,
      flight.departureTime,
      flight.arrivalTime,
      flight.createdAt,
      flight.updatedAt,
    ]),
    FLIGHT_BATCH_SIZE,
  );

  const routePriceByKey = new Map<string, Pick<RouteSeed, 'economyBase' | 'businessBase'>>();
  for (const route of ROUTES) {
    routePriceByKey.set(`${route.from}-${route.to}`, {
      economyBase: route.economyBase,
      businessBase: route.businessBase,
    });
  }

  const airportCodeById = new Map<string, string>();
  for (const [code, id] of airportIdByCode.entries()) {
    airportCodeById.set(id, code);
  }

  const allSeats: Primitive[][] = [];

  for (const flight of flights) {
    const routeKey = `${airportCodeById.get(flight.departureAirportId)}-${airportCodeById.get(flight.destinationAirportId)}`;
    const pricing = routePriceByKey.get(routeKey);

    if (!pricing) {
      throw new Error(`Missing pricing for route ${routeKey}`);
    }

    const seats = generateSeats(flight.id, pricing.economyBase, pricing.businessBase, now);
    for (const seat of seats) {
      allSeats.push([
        seat.id,
        seat.flightId,
        seat.seatNumber,
        seat.class,
        seat.row,
        seat.letter,
        seat.status,
        seat.price,
        seat.version,
        seat.createdAt,
        seat.updatedAt,
      ]);
    }
  }

  await insertRows(
    'Seat',
    ['id', 'flightId', 'seatNumber', 'class', 'row', 'letter', 'status', 'price', 'version', 'createdAt', 'updatedAt'],
    allSeats,
    SEAT_BATCH_SIZE,
  );

  console.log('');
  console.log(`Airports: ${AIRPORTS.length}`);
  console.log(`Flights: ${flights.length}`);
  console.log(`Seats: ${allSeats.length}`);
  console.log(`Date range: today + ${FLIGHT_HORIZON_DAYS - 1} days`);
  console.log('Remote bootstrap complete');
}

main().catch((error) => {
  console.error('Remote bootstrap failed:', error);
  process.exit(1);
});
