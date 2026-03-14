import axios from 'axios';
import { ApiResponse, City, Flight, Booking, Pagination } from './types';

const PREVIEW_FALLBACK_PORTS = new Set(['4173', '5173']);
const DEMO_AUTH_TOKEN = 'demo-local-token';
const DEMO_USER_KEY = 'yandex_air_demo_user';
const DEMO_PASSWORD_KEY = 'yandex_air_demo_password';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

const LOCAL_CITY_OPTIONS: City[] = [
  { name: 'Москва', code: 'SVO', airportName: 'Шереметьево', full: 'Москва (SVO)' },
  { name: 'Москва', code: 'DME', airportName: 'Домодедово', full: 'Москва (DME)' },
  { name: 'Москва', code: 'VKO', airportName: 'Внуково', full: 'Москва (VKO)' },
  { name: 'Сочи', code: 'AER', airportName: 'Адлер', full: 'Сочи (AER)' },
  { name: 'Санкт-Петербург', code: 'LED', airportName: 'Пулково', full: 'Санкт-Петербург (LED)' },
  { name: 'Казань', code: 'KZN', airportName: 'Казань', full: 'Казань (KZN)' },
  { name: 'Екатеринбург', code: 'SVX', airportName: 'Кольцово', full: 'Екатеринбург (SVX)' },
  { name: 'Новосибирск', code: 'OVB', airportName: 'Толмачево', full: 'Новосибирск (OVB)' },
  { name: 'Анталья', code: 'AYT', airportName: 'Анталья', full: 'Анталья (AYT)' },
  { name: 'Дубай', code: 'DXB', airportName: 'Dubai International', full: 'Дубай (DXB)' },
];

function isLocalPreviewFallback() {
  return typeof window !== 'undefined' &&
    !import.meta.env.VITE_API_BASE_URL &&
    PREVIEW_FALLBACK_PORTS.has(window.location.port);
}

function getStoredDemoUser() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(DEMO_USER_KEY);
    return raw ? JSON.parse(raw) as { id: string; email: string; name: string; createdAt: string } : null;
  } catch {
    return null;
  }
}

function saveDemoUser(user: { id: string; email: string; name: string; createdAt: string }, password: string) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(DEMO_USER_KEY, JSON.stringify(user));
  window.localStorage.setItem(DEMO_PASSWORD_KEY, password);
}

function ensureDemoUser() {
  const user = getStoredDemoUser();
  if (!user) {
    throw new Error('Сначала создайте аккаунт пассажира.');
  }
  return user;
}

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
  if (isLocalPreviewFallback()) {
    const user = {
      id: 'demo-user',
      email,
      name,
      createdAt: new Date().toISOString(),
    };

    saveDemoUser(user, password);
    return { user, token: DEMO_AUTH_TOKEN };
  }

  const { data } = await api.post<ApiResponse<{ user: { id: string; email: string; name: string; createdAt: string }; token: string }>>('/auth/register', {
    email, password, name,
  });
  return data.data;
}

export async function loginApi(email: string, password: string) {
  if (isLocalPreviewFallback()) {
    const user = getStoredDemoUser();
    const storedPassword = typeof window !== 'undefined' ? window.localStorage.getItem(DEMO_PASSWORD_KEY) : null;

    if (!user || user.email !== email || storedPassword !== password) {
      throw new Error('Неверный email или пароль.');
    }

    return { user, token: DEMO_AUTH_TOKEN };
  }

  const { data } = await api.post<ApiResponse<{ user: { id: string; email: string; name: string; createdAt: string }; token: string }>>('/auth/login', {
    email, password,
  });
  return data.data;
}

export async function getProfile(token: string) {
  if (isLocalPreviewFallback()) {
    if (token !== DEMO_AUTH_TOKEN) {
      throw new Error('Сессия недействительна.');
    }

    return ensureDemoUser();
  }

  const { data } = await api.get<ApiResponse<{ id: string; email: string; name: string; createdAt: string }>>('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data.data;
}

// ── Flights & Cities (public) ────────────────────────────

export async function searchCities(query: string): Promise<City[]> {
  if (isLocalPreviewFallback()) {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return [];
    }

    return LOCAL_CITY_OPTIONS.filter((city) =>
      city.name.toLowerCase().includes(normalizedQuery) ||
      city.code.toLowerCase().includes(normalizedQuery) ||
      city.airportName?.toLowerCase().includes(normalizedQuery),
    ).slice(0, 6);
  }

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
  if (isLocalPreviewFallback()) {
    throw new Error('LOCAL_PREVIEW_FALLBACK');
  }

  const { data } = await api.get<ApiResponse<Flight[]> & { pagination: Pagination }>('/flights', { params });
  return { flights: data.data, pagination: data.pagination };
}

export async function getFlightById(id: string): Promise<Flight> {
  if (isLocalPreviewFallback()) {
    throw new Error('LOCAL_PREVIEW_FALLBACK');
  }

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
  if (isLocalPreviewFallback()) {
    throw new Error('LOCAL_PREVIEW_FALLBACK');
  }

  const { data } = await api.get<ApiResponse<Booking>>(`/bookings/${id}`);
  return data.data;
}

export async function cancelBooking(id: string): Promise<Booking> {
  const { data } = await api.post<ApiResponse<Booking>>(`/bookings/${id}/cancel`);
  return data.data;
}

export async function confirmBooking(id: string): Promise<Booking> {
  const { data } = await api.post<ApiResponse<Booking>>(`/bookings/${id}/confirm`);
  return data.data;
}

export async function updateProfileApi(name: string) {
  if (isLocalPreviewFallback()) {
    const currentUser = ensureDemoUser();
    const updatedUser = { ...currentUser, name };
    const storedPassword = typeof window !== 'undefined' ? window.localStorage.getItem(DEMO_PASSWORD_KEY) || '' : '';
    saveDemoUser(updatedUser, storedPassword);
    return updatedUser;
  }

  const { data } = await api.put<ApiResponse<{ id: string; email: string; name: string; createdAt: string }>>('/auth/profile', { name });
  return data.data;
}

export async function updatePasswordApi(oldPassword: string, newPassword: string) {
  if (isLocalPreviewFallback()) {
    if (typeof window === 'undefined') {
      return null;
    }

    const storedPassword = window.localStorage.getItem(DEMO_PASSWORD_KEY);
    if (storedPassword !== oldPassword) {
      throw new Error('Текущий пароль указан неверно.');
    }

    window.localStorage.setItem(DEMO_PASSWORD_KEY, newPassword);
    return null;
  }

  const { data } = await api.put<ApiResponse<null>>('/auth/password', { oldPassword, newPassword });
  return data.data;
}
