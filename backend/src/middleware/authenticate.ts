import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../services/authService';

/**
 * Extend Express Request to include the authenticated user.
 */
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * JWT authentication middleware.
 * 
 * Extracts the Bearer token from the Authorization header,
 * verifies it, and attaches the decoded payload to `req.user`.
 * 
 * Usage: router.post('/protected', authenticate, handler)
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      status: 'error',
      message: 'Authentication required. Please provide a Bearer token.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token. Please login again.',
    });
  }
}
