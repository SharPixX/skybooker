import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { SearchCitiesQuery } from '../schemas';

export async function searchCities(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { q } = req.query as unknown as SearchCitiesQuery;
    const normalizedQuery = q.trim();

    if (!normalizedQuery || normalizedQuery.length < 2) {
      res.json({ status: 'ok', data: [] });
      return;
    }

    // Use startsWith for city/name (natural autocomplete), contains for IATA code
    const airports = await prisma.airport.findMany({
      where: {
        OR: [
          { city: { startsWith: normalizedQuery, mode: 'insensitive' } },
          { name: { startsWith: normalizedQuery, mode: 'insensitive' } },
          { code: { startsWith: normalizedQuery, mode: 'insensitive' } },
          { city: { contains: normalizedQuery, mode: 'insensitive' } },
          { name: { contains: normalizedQuery, mode: 'insensitive' } },
        ],
      },
      orderBy: { city: 'asc' },
      take: 20,
    });

    // Deduplicate (startsWith + contains can return same airport)
    const seen = new Set<string>();
    const cities = airports
      .filter((a) => {
        if (seen.has(a.id)) return false;
        seen.add(a.id);
        return true;
      })
      .map((a) => ({
        name: a.city,
        code: a.code,
        airportName: a.name,
        full: `${a.city} (${a.code})`,
      }));

    res.json({ status: 'ok', data: cities });
  } catch (error) {
    next(error);
  }
}
