import axios from 'axios';
import { ApiResponse, Booking, City, Flight, Pagination } from './types';
import { getMockBookingById, getMockFlightById, listMockBookings, searchMockFlights } from './mockData';
import { IS_DEMO_MODE } from './runtimeMode';

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

export {
  APP_MODE,
  APP_MODE_DESCRIPTION,
  APP_MODE_LABEL,
  IS_DEMO_MODE,
} from './runtimeMode';

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

function normalizeDemoEmail(email: string) {
  return email.trim().toLowerCase();
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

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export async function registerApi(email: string, password: string, name: string) {
  if (IS_DEMO_MODE) {
    const user = {
      id: 'demo-user',
      email: normalizeDemoEmail(email),
      name: name.trim(),
      createdAt: new Date().toISOString(),
    };

    saveDemoUser(user, password);
    return { user, token: DEMO_AUTH_TOKEN };
  }

  const { data } = await api.post<ApiResponse<{ user: { id: string; email: string; name: string; createdAt: string }; token: string }>>('/auth/register', {
    email,
    password,
    name,
  });

  return data.data;
}

export async function loginApi(email: string, password: string) {
  if (IS_DEMO_MODE) {
    const user = getStoredDemoUser();
    const storedPassword = typeof window !== 'undefined' ? window.localStorage.getItem(DEMO_PASSWORD_KEY) : null;
    const normalizedEmail = normalizeDemoEmail(email);

    if (!user || user.email !== normalizedEmail || storedPassword !== password) {
      throw new Error('Неверный email или пароль.');
    }

    return { user, token: DEMO_AUTH_TOKEN };
  }

  const { data } = await api.post<ApiResponse<{ user: { id: string; email: string; name: string; createdAt: string }; token: string }>>('/auth/login', {
    email,
    password,
  });

  return data.data;
}

export async function getProfile(token: string) {
  if (IS_DEMO_MODE) {
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

export async function searchCities(query: string, signal?: AbortSignal): Promise<City[]> {
  if (IS_DEMO_MODE) {
    const normalizedQuery = query.trim().toLowerCase();

    if (normalizedQuery.length < 2) {
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
    signal,
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
  if (IS_DEMO_MODE) {
    return searchMockFlights(params);
  }

  const { data } = await api.get<ApiResponse<Flight[]> & { pagination: Pagination }>('/flights', { params });
  return { flights: data.data, pagination: data.pagination };
}

export async function getFlightById(id: string): Promise<Flight> {
  if (IS_DEMO_MODE) {
    const flight = getMockFlightById(id);

    if (!flight) {
      throw new Error('Рейс не найден.');
    }

    return flight;
  }

  const { data } = await api.get<ApiResponse<Flight>>(`/flights/${id}`);
  return data.data;
}

export async function bookSeat(seatId: string): Promise<{ booking: Booking; message: string }> {
  const { data } = await api.post<ApiResponse<Booking> & { message: string }>('/bookings', { seatId });
  return { booking: data.data, message: data.message || '' };
}

export async function getBooking(id: string): Promise<Booking> {
  if (IS_DEMO_MODE) {
    const booking = getMockBookingById(id);

    if (!booking) {
      throw new Error('Бронирование не найдено.');
    }

    return booking;
  }

  const { data } = await api.get<ApiResponse<Booking>>(`/bookings/${id}`);
  return data.data;
}

export async function getMyBookings(): Promise<Booking[]> {
  if (IS_DEMO_MODE) {
    return listMockBookings();
  }

  const { data } = await api.get<ApiResponse<Booking[]>>('/bookings');
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
  if (IS_DEMO_MODE) {
    const currentUser = ensureDemoUser();
    const updatedUser = { ...currentUser, name: name.trim() };
    const storedPassword = typeof window !== 'undefined' ? window.localStorage.getItem(DEMO_PASSWORD_KEY) || '' : '';

    saveDemoUser(updatedUser, storedPassword);
    return updatedUser;
  }

  const { data } = await api.put<ApiResponse<{ id: string; email: string; name: string; createdAt: string }>>('/auth/profile', { name });
  return data.data;
}

export async function updatePasswordApi(oldPassword: string, newPassword: string): Promise<{ token: string } | null> {
  if (IS_DEMO_MODE) {
    if (typeof window === 'undefined') {
      return null;
    }

    const storedPassword = window.localStorage.getItem(DEMO_PASSWORD_KEY);

    if (storedPassword !== oldPassword) {
      throw new Error('Текущий пароль указан неверно.');
    }

    window.localStorage.setItem(DEMO_PASSWORD_KEY, newPassword);
    return { token: DEMO_AUTH_TOKEN };
  }

  const { data } = await api.put<ApiResponse<{ token: string }>>('/auth/password', { oldPassword, newPassword });
  return data.data;
}
