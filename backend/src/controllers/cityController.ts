import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { SearchCitiesQuery } from '../schemas';

export async function searchCities(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { q } = req.query as unknown as SearchCitiesQuery;

    if (!q || q.length < 1) {
      res.json({ status: 'ok', data: [] });
      return;
    }

    const airports = await prisma.airport.findMany({
      where: {
        OR: [
          { city: { contains: q, mode: 'insensitive' } },
          { code: { contains: q, mode: 'insensitive' } },
          { name: { contains: q, mode: 'insensitive' } },
        ],
      },
      orderBy: { city: 'asc' },
      take: 20, // Limit results to prevent unbounded queries
    });

    const cities = airports.map((a) => ({
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
