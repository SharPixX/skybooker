import bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

const SALT_ROUNDS = 10;
const JWT_EXPIRES_IN = '7d';

// SECURITY: In production, JWT_SECRET MUST be set via environment variable.
// Fail fast on startup if missing in production to prevent token forgery.
const JWT_SECRET = (() => {
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('FATAL: JWT_SECRET environment variable is not set in production!');
  }
  return secret || 'skybooker-dev-secret-change-in-production';
})();

export interface JwtPayload {
  userId: string;
  email: string;
  sessionStamp: string;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function buildSessionStamp(passwordHash: string): string {
  return createHash('sha256').update(passwordHash).digest('hex').slice(0, 16);
}

function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export async function verifyToken(token: string): Promise<JwtPayload> {
  let decoded: JwtPayload;

  try {
    decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }) as JwtPayload;
  } catch {
    throw new AppError('Invalid or expired token', 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { id: true, email: true, password: true },
  });

  if (!user) {
    throw new AppError('Invalid or expired token', 401);
  }

  if (buildSessionStamp(user.password) !== decoded.sessionStamp) {
    throw new AppError('Invalid or expired token', 401);
  }

  return {
    userId: user.id,
    email: user.email,
    sessionStamp: decoded.sessionStamp,
  };
}

/**
 * Register a new user. Returns the user + JWT token.
 */
export async function register(email: string, password: string, name: string) {
  const normalizedEmail = normalizeEmail(email);

  // Check if user already exists
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    throw new AppError('Registration failed. Please try a different email.', 409);
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { email: normalizedEmail, password: hashedPassword, name: name.trim() },
    select: { id: true, email: true, name: true, createdAt: true },
  });

  const token = signToken({
    userId: user.id,
    email: user.email,
    sessionStamp: buildSessionStamp(hashedPassword),
  });

  return { user, token };
}

/**
 * Login with email + password. Returns the user + JWT token.
 */
export async function login(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = signToken({
    userId: user.id,
    email: user.email,
    sessionStamp: buildSessionStamp(user.password),
  });

  return {
    user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt },
    token,
  };
}

/**
 * Get user profile by ID (excludes password).
 */
export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, createdAt: true },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
}

export async function updateProfile(userId: string, name: string) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { name: name.trim() },
    select: { id: true, email: true, name: true, createdAt: true },
  });
  return user;
}

export async function updatePassword(userId: string, oldPassword: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const isValid = await bcrypt.compare(oldPassword, user.password);
  if (!isValid) {
    throw new AppError('Incorrect current password', 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
  
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
  
  return {
    token: signToken({
      userId: user.id,
      email: user.email,
      sessionStamp: buildSessionStamp(hashedPassword),
    }),
  };
}
