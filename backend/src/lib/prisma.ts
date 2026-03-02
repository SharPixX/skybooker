import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';

// Let Prisma read DATABASE_URL from schema.prisma. DIRECT_URL is for CLI/migrations.
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

export default prisma;
