import type { Booking } from './types';

const RECENT_BOOKINGS_KEY = 'yandex_air_recent_bookings';

export interface RecentBookingSummary {
  id: string;
  route: string;
  flightNumber: string;
  seatNumber: string;
  status: Booking['status'];
  departureTime: string;
  arrivalTime?: string;
  departureAirportCode: string;
  destinationAirportCode: string;
  price: string;
  updatedAt: string;
}

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function getRecentBookings(): RecentBookingSummary[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(RECENT_BOOKINGS_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as RecentBookingSummary[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRecentBooking(booking: Booking) {
  if (!isBrowser()) {
    return;
  }

  const summary: RecentBookingSummary = {
    id: booking.id,
    route: `${booking.seat.flight.departureAirport.city} → ${booking.seat.flight.destinationAirport.city}`,
    flightNumber: booking.seat.flight.flightNumber,
    seatNumber: booking.seat.seatNumber,
    status: booking.status,
    departureTime: booking.seat.flight.departureTime,
    arrivalTime: booking.seat.flight.arrivalTime,
    departureAirportCode: booking.seat.flight.departureAirport.code,
    destinationAirportCode: booking.seat.flight.destinationAirport.code,
    price: booking.seat.price,
    updatedAt: new Date().toISOString(),
  };

  const current = getRecentBookings().filter((item) => item.id !== booking.id);
  const next = [summary, ...current].slice(0, 6);
  window.localStorage.setItem(RECENT_BOOKINGS_KEY, JSON.stringify(next));
}
