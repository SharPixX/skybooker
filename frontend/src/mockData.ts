import type { Booking, Flight, Pagination, Seat } from './types';

const MOCK_STORAGE_KEY = 'yandex-air-demo-bookings';
const MOCK_HORIZON_DAYS = 10;

interface MockRouteTemplate {
  from: string;
  to: string;
  departures: string[];
  durationMinutes: number;
  aircraftType: string;
  minEconomyPrice: number;
  standardPrice: number;
  minBusinessPrice: number;
}

const AIRPORTS = {
  SVO: { id: 'airport-svo', code: 'SVO', name: 'Шереметьево', city: 'Москва', country: 'Россия' },
  DME: { id: 'airport-dme', code: 'DME', name: 'Домодедово', city: 'Москва', country: 'Россия' },
  VKO: { id: 'airport-vko', code: 'VKO', name: 'Внуково', city: 'Москва', country: 'Россия' },
  LED: { id: 'airport-led', code: 'LED', name: 'Пулково', city: 'Санкт-Петербург', country: 'Россия' },
  AER: { id: 'airport-aer', code: 'AER', name: 'Адлер', city: 'Сочи', country: 'Россия' },
  KZN: { id: 'airport-kzn', code: 'KZN', name: 'Казань', city: 'Казань', country: 'Россия' },
  SVX: { id: 'airport-svx', code: 'SVX', name: 'Кольцово', city: 'Екатеринбург', country: 'Россия' },
  OVB: { id: 'airport-ovb', code: 'OVB', name: 'Толмачево', city: 'Новосибирск', country: 'Россия' },
  AYT: { id: 'airport-ayt', code: 'AYT', name: 'Анталья', city: 'Анталья', country: 'Турция' },
  DXB: { id: 'airport-dxb', code: 'DXB', name: 'Dubai International', city: 'Дубай', country: 'ОАЭ' },
} as const;

const ROUTES: MockRouteTemplate[] = [
  {
    from: 'SVO',
    to: 'AER',
    departures: ['06:40', '12:25', '19:55'],
    durationMinutes: 235,
    aircraftType: 'Boeing 737-800',
    minEconomyPrice: 5490,
    standardPrice: 7490,
    minBusinessPrice: 16200,
  },
  {
    from: 'AER',
    to: 'SVO',
    departures: ['08:50', '15:20', '22:10'],
    durationMinutes: 235,
    aircraftType: 'Boeing 737-800',
    minEconomyPrice: 5490,
    standardPrice: 7490,
    minBusinessPrice: 16200,
  },
  {
    from: 'SVO',
    to: 'DXB',
    departures: ['09:15'],
    durationMinutes: 330,
    aircraftType: 'Boeing 777-300',
    minEconomyPrice: 12500,
    standardPrice: 18300,
    minBusinessPrice: 38900,
  },
  {
    from: 'DXB',
    to: 'SVO',
    departures: ['16:20'],
    durationMinutes: 330,
    aircraftType: 'Boeing 777-300',
    minEconomyPrice: 12500,
    standardPrice: 18300,
    minBusinessPrice: 38900,
  },
  {
    from: 'DME',
    to: 'KZN',
    departures: ['07:05', '18:10'],
    durationMinutes: 95,
    aircraftType: 'Boeing 737-800',
    minEconomyPrice: 5400,
    standardPrice: 6990,
    minBusinessPrice: 17400,
  },
  {
    from: 'KZN',
    to: 'DME',
    departures: ['09:40', '20:40'],
    durationMinutes: 95,
    aircraftType: 'Boeing 737-800',
    minEconomyPrice: 5400,
    standardPrice: 6990,
    minBusinessPrice: 17400,
  },
  {
    from: 'DME',
    to: 'LED',
    departures: ['08:00', '14:15', '20:35'],
    durationMinutes: 90,
    aircraftType: 'Boeing 737-800',
    minEconomyPrice: 7802,
    standardPrice: 9100,
    minBusinessPrice: 18900,
  },
  {
    from: 'LED',
    to: 'DME',
    departures: ['09:50', '16:10', '22:25'],
    durationMinutes: 90,
    aircraftType: 'Boeing 737-800',
    minEconomyPrice: 7802,
    standardPrice: 9100,
    minBusinessPrice: 18900,
  },
  {
    from: 'VKO',
    to: 'AYT',
    departures: ['10:30'],
    durationMinutes: 290,
    aircraftType: 'Boeing 737-800',
    minEconomyPrice: 12800,
    standardPrice: 16300,
    minBusinessPrice: 36900,
  },
  {
    from: 'AYT',
    to: 'VKO',
    departures: ['18:20'],
    durationMinutes: 290,
    aircraftType: 'Boeing 737-800',
    minEconomyPrice: 12800,
    standardPrice: 16300,
    minBusinessPrice: 36900,
  },
  {
    from: 'LED',
    to: 'AER',
    departures: ['07:40'],
    durationMinutes: 260,
    aircraftType: 'Boeing 737-800',
    minEconomyPrice: 6900,
    standardPrice: 8450,
    minBusinessPrice: 21400,
  },
  {
    from: 'AER',
    to: 'LED',
    departures: ['19:10'],
    durationMinutes: 260,
    aircraftType: 'Boeing 737-800',
    minEconomyPrice: 6900,
    standardPrice: 8450,
    minBusinessPrice: 21400,
  },
];

type SearchMockFlightsParams = {
  from?: string;
  to?: string;
  date?: string;
  page?: number;
  limit?: number;
};

let cachedFlights: Flight[] | null = null;

function startOfTodayUtc() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
}

function buildUtcDate(dayOffset: number, time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  const date = startOfTodayUtc();
  date.setUTCDate(date.getUTCDate() + dayOffset);
  date.setUTCHours(hours, minutes, 0, 0);
  return date;
}

function parseLocation(input: string) {
  const match = input.match(/^(.+?)\s*\(([A-Z]{3})\)$/);
  return {
    city: match?.[1]?.trim() ?? input.trim(),
    code: match?.[2] ?? null,
  };
}

function matchesLocation(input: string | undefined, airport: Flight['departureAirport']) {
  if (!input?.trim()) {
    return true;
  }

  const { city, code } = parseLocation(input);
  if (code) {
    return airport.code === code;
  }

  const normalized = city.toLowerCase();
  return airport.city.toLowerCase().includes(normalized) || airport.code.toLowerCase().includes(normalized);
}

function getSeatAvailability(aircraftType: string) {
  if (aircraftType.includes('777')) {
    return { economySeatsAvail: 396, businessSeatsAvail: 29 };
  }

  return { economySeatsAvail: 152, businessSeatsAvail: 15 };
}

function buildMockCatalog() {
  if (cachedFlights) {
    return cachedFlights;
  }

  const flights: Flight[] = [];
  let counter = 201;

  for (let dayOffset = 0; dayOffset < MOCK_HORIZON_DAYS; dayOffset += 1) {
    for (const route of ROUTES) {
      for (const departure of route.departures) {
        const departureTime = buildUtcDate(dayOffset, departure);
        const arrivalTime = new Date(departureTime.getTime() + route.durationMinutes * 60_000);
        const { economySeatsAvail, businessSeatsAvail } = getSeatAvailability(route.aircraftType);

        flights.push({
          id: `mock-${route.from.toLowerCase()}-${route.to.toLowerCase()}-${dayOffset}-${counter}`,
          flightNumber: `YA-${counter}`,
          aircraftType: route.aircraftType,
          departureAirport: AIRPORTS[route.from as keyof typeof AIRPORTS],
          destinationAirport: AIRPORTS[route.to as keyof typeof AIRPORTS],
          departureTime: departureTime.toISOString(),
          arrivalTime: arrivalTime.toISOString(),
          durationMinutes: route.durationMinutes,
          minPrice: route.minEconomyPrice,
          minEconomyPrice: route.minEconomyPrice,
          standardPrice: route.standardPrice,
          minBusinessPrice: route.minBusinessPrice,
          economySeatsAvail,
          businessSeatsAvail,
        });

        counter += 1;
      }
    }
  }

  cachedFlights = flights;
  return flights;
}

function buildSeats(flight: Flight): Seat[] {
  const isWideBody = flight.aircraftType?.includes('777');
  const businessRows = isWideBody ? [1, 2, 3, 4, 5] : [1, 2, 3, 4];
  const economyRows = isWideBody
    ? Array.from({ length: 40 }, (_, index) => index + 6)
    : Array.from({ length: 26 }, (_, index) => index + 5);
  const businessLetters = isWideBody ? ['A', 'C', 'D', 'G', 'H', 'K'] : ['A', 'C', 'D', 'F'];
  const economyLetters = isWideBody ? ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'] : ['A', 'B', 'C', 'D', 'E', 'F'];
  const seats: Seat[] = [];

  for (const row of businessRows) {
    for (const letter of businessLetters) {
      const isWindow = ['A', 'F', 'K'].includes(letter);
      const price = (flight.minBusinessPrice ?? 38900) + (isWindow ? 500 : 220) - row * 180;
      const status =
        row === 2 && letter === 'A'
          ? 'BOOKED'
          : row === 3 && letter === businessLetters[0]
            ? 'LOCKED'
            : 'AVAILABLE';

      seats.push({
        id: `mock-seat-${flight.id}-${row}${letter}`,
        seatNumber: `${row}${letter}`,
        class: 'business',
        status,
        price: String(price),
        row,
        letter,
        flightId: flight.id,
        version: 1,
      });
    }
  }

  for (const row of economyRows) {
    for (const letter of economyLetters) {
      const isWindow = ['A', 'F', 'K'].includes(letter);
      const isExit = row === 12 || row === 20 || row === 25 || row === 35;
      const price = (flight.minEconomyPrice ?? flight.minPrice ?? 5490) + (isWindow ? 320 : 0) + (isExit ? 900 : 0) + (row - economyRows[0]) * 70;
      const status =
        (row === 8 && letter === economyLetters[economyLetters.length - 1]) || (row === 19 && letter === economyLetters[2])
          ? 'BOOKED'
          : (row === 11 && letter === economyLetters[0]) || (row === 12 && letter === economyLetters[economyLetters.length - 1])
            ? 'LOCKED'
            : 'AVAILABLE';

      seats.push({
        id: `mock-seat-${flight.id}-${row}${letter}`,
        seatNumber: `${row}${letter}`,
        class: 'economy',
        status,
        price: String(price),
        row,
        letter,
        flightId: flight.id,
        version: 1,
      });
    }
  }

  return seats;
}

export function searchMockFlights(params: SearchMockFlightsParams): { flights: Flight[]; pagination: Pagination } {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const date = params.date?.trim();

  const filtered = buildMockCatalog().filter((flight) => {
    if (!matchesLocation(params.from, flight.departureAirport)) {
      return false;
    }

    if (!matchesLocation(params.to, flight.destinationAirport)) {
      return false;
    }

    if (date) {
      const departure = new Date(flight.departureTime);
      const fromDate = new Date(`${date}T00:00:00.000Z`);
      const toDate = new Date(`${date}T00:00:00.000Z`);
      toDate.setUTCDate(toDate.getUTCDate() + 1);
      return departure >= fromDate && departure < toDate;
    }

    return true;
  });

  const start = (page - 1) * limit;
  const slice = filtered.slice(start, start + limit);

  return {
    flights: slice,
    pagination: {
      page,
      limit,
      total: filtered.length,
      totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
    },
  };
}

export function getMockFlightById(id: string): Flight | null {
  const baseFlight = buildMockCatalog().find((flight) => flight.id === id);
  if (!baseFlight) {
    return null;
  }

  return {
    ...baseFlight,
    seats: buildSeats(baseFlight),
  };
}

function readMockBookings(): Record<string, Booking> {
  const raw = sessionStorage.getItem(MOCK_STORAGE_KEY);
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as Record<string, Booking>;
  } catch {
    return {};
  }
}

function writeMockBookings(bookings: Record<string, Booking>) {
  sessionStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(bookings));
}

export function createMockBooking(flight: Flight, seat: Seat): Booking {
  const id = `demo-${Date.now()}`;
  const booking: Booking = {
    id,
    userId: 'demo-user',
    seatId: seat.id,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
    seat: {
      ...seat,
      flight,
    },
  };

  const bookings = readMockBookings();
  bookings[id] = booking;
  writeMockBookings(bookings);

  return booking;
}

export function updateMockBookingStatus(id: string, status: Booking['status']): Booking | null {
  const bookings = readMockBookings();
  const current = bookings[id];

  if (!current) {
    return null;
  }

  const updated = {
    ...current,
    status,
  };

  bookings[id] = updated;
  writeMockBookings(bookings);
  return updated;
}

export function getMockBookingById(id: string): Booking | null {
  const bookings = readMockBookings();
  return bookings[id] ?? null;
}
