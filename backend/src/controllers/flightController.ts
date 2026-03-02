import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';
import { SearchFlightsQuery } from '../schemas';
import { AppError } from '../middleware/errorHandler';

/** Parse "Москва (SVO)" → { city: "Москва", code: "SVO" }, or just use as-is */
function parseLocation(input: string): { city: string; code: string | null } {
  const match = input.match(/^(.+?)\s*\(([A-Z]{3})\)$/);
  if (match) return { city: match[1].trim(), code: match[2] };
  return { city: input, code: null };
}

function buildAirportFilter(input: string): Prisma.AirportWhereInput {
  const { city, code } = parseLocation(input);
  if (code) {
    // Exact code match — most precise
    return { code };
  }
  return {
    OR: [
      { city: { contains: city, mode: 'insensitive' } },
      { code: { contains: city, mode: 'insensitive' } },
    ],
  };
}

export async function searchFlights(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { from, to, date, page: rawPage, limit: rawLimit } = req.query as unknown as SearchFlightsQuery;
    const page = Number(rawPage) || 1;
    const limit = Number(rawLimit) || 20;

    const where: Prisma.FlightWhereInput = {};

    if (from) {
      where.departureAirport = buildAirportFilter(from);
    }
    if (to) {
      where.destinationAirport = buildAirportFilter(to);
    }
    if (date) {
      // Use explicit UTC to avoid timezone bugs on non-UTC servers
      const searchDate = new Date(date + 'T00:00:00.000Z');
      const nextDay = new Date(date + 'T00:00:00.000Z');
      nextDay.setUTCDate(nextDay.getUTCDate() + 1);
      where.departureTime = { gte: searchDate, lt: nextDay };
    }

    const skip = (page - 1) * limit;

    const [flights, total] = await Promise.all([
      prisma.flight.findMany({
        where,
        include: {
          departureAirport: true,
          destinationAirport: true,
          seats: {
            select: { status: true, price: true, class: true },
          },
        },
        orderBy: { departureTime: 'asc' },
        skip,
        take: limit,
      }),
      prisma.flight.count({ where }),
    ]);

    // Compute aggregates with per-class pricing and strip the raw seat array
    const result = flights.map(({ seats, ...flight }) => {
      const available = seats.filter((s) => s.status === 'AVAILABLE');
      const economyAvail = available.filter((s) => s.class === 'economy');
      const businessAvail = available.filter((s) => s.class === 'business');

      const economyPrices = economyAvail.map((s) => parseFloat(String(s.price)));
      const businessPrices = businessAvail.map((s) => parseFloat(String(s.price)));

      const minEconomy = economyPrices.length > 0 ? Math.min(...economyPrices) : null;
      const minBusiness = businessPrices.length > 0 ? Math.min(...businessPrices) : null;
      // "Standard" tier = median economy price (economy with extras)
      const sortedEconomy = [...economyPrices].sort((a, b) => a - b);
      const medianEconomy = sortedEconomy.length > 0
        ? sortedEconomy[Math.floor(sortedEconomy.length * 0.6)]
        : null;

      // Duration in minutes
      let durationMinutes: number | null = null;
      if (flight.arrivalTime && flight.departureTime) {
        durationMinutes = Math.round(
          (new Date(flight.arrivalTime).getTime() - new Date(flight.departureTime).getTime()) / 60000
        );
      }

      return {
        ...flight,
        availableSeats: available.length,
        totalSeats: seats.length,
        minPrice: economyPrices.length > 0 ? Math.min(...economyPrices) : (businessPrices.length > 0 ? Math.min(...businessPrices) : null),
        minEconomyPrice: minEconomy,
        standardPrice: medianEconomy,
        minBusinessPrice: minBusiness,
        economySeatsAvail: economyAvail.length,
        businessSeatsAvail: businessAvail.length,
        durationMinutes,
      };
    });

    res.json({
      status: 'ok',
      data: result,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
}

export async function getFlightById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;

    const flight = await prisma.flight.findUnique({
      where: { id },
      include: {
        departureAirport: true,
        destinationAirport: true,
        seats: { orderBy: { seatNumber: 'asc' } },
      },
    });

    if (!flight) {
      throw new AppError('Flight not found', 404);
    }

    res.json({ status: 'ok', data: flight });
  } catch (error) {
    next(error);
  }
}
