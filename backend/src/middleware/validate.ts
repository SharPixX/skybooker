import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

type RequestLocation = 'body' | 'query' | 'params';

/**
 * Express middleware that validates req[location] against a Zod schema.
 * On failure returns 400 with structured error details.
 */
export function validate(schema: z.ZodType, location: RequestLocation = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[location]);
      // For 'body' we can replace directly; for 'query' and 'params' (read-only getters)
      // we merge the parsed values back so downstream handlers see coerced/defaulted values
      if (location === 'body') {
        req.body = parsed;
      } else {
        Object.assign(req[location], parsed);
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        }));
        res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          details,
        });
        return;
      }
      next(err);
    }
  };
}
