import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler.
 *
 * Operational errors (AppError) return the message to the client.
 * Unexpected errors are logged with stack trace and return a generic 500.
 * In production, stack traces are never sent to the client.
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // Log full details server-side for debugging
  console.error(`[ERROR] ${req.method} ${req.originalUrl}`, {
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
  });

  const isProduction = process.env.NODE_ENV === 'production';

  return res.status(500).json({
    status: 'error',
    message: isProduction ? 'Internal server error' : err.message,
    ...(isProduction ? {} : { stack: err.stack }),
  });
}
