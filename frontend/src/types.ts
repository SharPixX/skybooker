export interface City {
  name: string;
  code: string;
  airportName?: string;
  full: string;
}

export interface Airport {
  id: string;
  code: string;
  name: string;
  city: string;
  country: string;
}

export interface Seat {
  id: string;
  seatNumber: string;
  status: 'AVAILABLE' | 'LOCKED' | 'BOOKED';
  price: string;
  class?: string;
  row?: number;
  letter?: string;
  flightId?: string;
  version?: number;
}

export interface Flight {
  id: string;
  flightNumber: string;
  departureAirport: Airport;
  destinationAirport: Airport;
  departureAirportId?: string;
  destinationAirportId?: string;
  departureTime: string;
  arrivalTime?: string;
  aircraftType?: string;
  seats?: Seat[];
  availableSeats?: number;
  totalSeats?: number;
  minPrice?: number | null;
  minEconomyPrice?: number | null;
  standardPrice?: number | null;
  minBusinessPrice?: number | null;
  economySeatsAvail?: number;
  businessSeatsAvail?: number;
  durationMinutes?: number | null;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Booking {
  id: string;
  userId: string;
  seatId: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'FAILED';
  expiresAt: string;
  createdAt: string;
  seat: Seat & {
    flight: Flight;
  };
}

export interface ApiResponse<T> {
  status: 'ok' | 'error';
  message?: string;
  data: T;
}
