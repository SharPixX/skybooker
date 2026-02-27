import axios from 'axios';
import { ApiResponse, City, Flight, Booking, Pagination } from './types';

const api = axios.create({
  baseURL: '/api',
});

// ── Auth interceptor ─────────────────────────────────────
// Automatically attach JWT token to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auth API ─────────────────────────────────────────────

export async function registerApi(email: string, password: string, name: string) {
  const { data } = await api.post<ApiResponse<{ user: { id: string; email: string; name: string; createdAt: string }; token: string }>>('/auth/register', {
    email, password, name,
  });
  return data.data;
}

export async function loginApi(email: string, password: string) {
  const { data } = await api.post<ApiResponse<{ user: { id: string; email: string; name: string; createdAt: string }; token: string }>>('/auth/login', {
    email, password,
  });
  return data.data;
}

export async function getProfile(token: string) {
  const { data } = await api.get<ApiResponse<{ id: string; email: string; name: string; createdAt: string }>>('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data.data;
}

// ── Flights & Cities (public) ────────────────────────────

export async function searchCities(query: string): Promise<City[]> {
  const { data } = await api.get<ApiResponse<City[]>>('/cities', {
    params: { q: query },
  });
  return data.data;
}

export async function searchFlights(params: {
  from?: string;
  to?: string;
  date?: string;
  page?: number;
  limit?: number;
}): Promise<{ flights: Flight[]; pagination: Pagination }> {
  const { data } = await api.get<ApiResponse<Flight[]> & { pagination: Pagination }>('/flights', { params });
  return { flights: data.data, pagination: data.pagination };
}

export async function getFlightById(id: string): Promise<Flight> {
  const { data } = await api.get<ApiResponse<Flight>>(`/flights/${id}`);
  return data.data;
}

// ── Bookings (requires JWT) ──────────────────────────────

export async function bookSeat(seatId: string): Promise<{ booking: Booking; message: string }> {
  const { data } = await api.post<ApiResponse<Booking> & { message: string }>('/bookings', {
    seatId,
  });
  return { booking: data.data, message: data.message || '' };
}

export async function getBooking(id: string): Promise<Booking> {
  const { data } = await api.get<ApiResponse<Booking>>(`/bookings/${id}`);
  return data.data;
}

export async function cancelBooking(id: string): Promise<Booking> {
  const { data } = await api.post<ApiResponse<Booking>>(`/bookings/${id}/cancel`);
  return data.data;
}
