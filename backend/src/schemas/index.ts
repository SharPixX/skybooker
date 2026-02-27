import { z } from 'zod';

// ── Auth ─────────────────────────────────────────────────────

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required').max(100),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ── Flights ──────────────────────────────────────────────────

export const searchFlightsSchema = z.object({
  from: z.string().optional().transform(v => v === '' ? undefined : v),
  to: z.string().optional().transform(v => v === '' ? undefined : v),
  date: z
    .string()
    .optional()
    .transform(v => v === '' ? undefined : v)
    .refine((v) => v === undefined || !isNaN(Date.parse(v)), { message: 'Invalid date format' }),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const flightIdParamSchema = z.object({
  id: z.string().uuid('Invalid flight ID'),
});

// ── Bookings ─────────────────────────────────────────────────

export const createBookingSchema = z.object({
  seatId: z.string().uuid('Invalid seatId'),
});

export const bookingIdParamSchema = z.object({
  id: z.string().uuid('Invalid booking ID'),
});

// ── Cities ───────────────────────────────────────────────────

export const searchCitiesSchema = z.object({
  q: z.string().optional().transform(v => v === '' ? undefined : v).default(''),
});

// ── Inferred types ───────────────────────────────────────────

export type RegisterBody = z.infer<typeof registerSchema>;
export type LoginBody = z.infer<typeof loginSchema>;
export type SearchFlightsQuery = z.infer<typeof searchFlightsSchema>;
export type CreateBookingBody = z.infer<typeof createBookingSchema>;
export type SearchCitiesQuery = z.infer<typeof searchCitiesSchema>;
