import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcrypt';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { login, register, updatePassword, updateProfile, verifyToken } from './authService';

type MockUserRecord = {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
};

function createMockUser(overrides: Partial<MockUserRecord> = {}): MockUserRecord {
  return {
    id: 'user-1',
    email: 'user@example.com',
    password: 'hashed-password',
    name: 'Test User',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

test('register normalizes email before checking and creating the user', async () => {
  const findUniqueCalls: string[] = [];
  const createEmails: string[] = [];
  const originalFindUnique = prisma.user.findUnique;
  const originalCreate = prisma.user.create;

  prisma.user.findUnique = (async (args: any) => {
    findUniqueCalls.push(args.where.email);
    return null;
  }) as unknown as typeof prisma.user.findUnique;

  prisma.user.create = (async (args: any) => {
    createEmails.push(args.data.email);

    return {
      id: 'new-user',
      email: args.data.email,
      name: args.data.name,
      createdAt: new Date('2026-02-01T00:00:00.000Z'),
    };
  }) as unknown as typeof prisma.user.create;

  try {
    const result = await register(' USER@Example.COM ', 'password123', '  Yandex Air  ');

    assert.deepEqual(findUniqueCalls, ['user@example.com']);
    assert.deepEqual(createEmails, ['user@example.com']);
    assert.equal(result.user.email, 'user@example.com');
    assert.equal(result.user.name, 'Yandex Air');
    assert.ok(result.token);
  } finally {
    prisma.user.findUnique = originalFindUnique;
    prisma.user.create = originalCreate;
  }
});

test('login accepts mixed-case email because auth normalizes it', async () => {
  const passwordHash = await bcrypt.hash('password123', 4);
  const user = createMockUser({ password: passwordHash });
  const originalFindUnique = prisma.user.findUnique;

  prisma.user.findUnique = (async (args: any) => {
    if (args.where.email === 'user@example.com' || args.where.id === user.id) {
      return user;
    }

    return null;
  }) as unknown as typeof prisma.user.findUnique;

  try {
    const result = await login(' User@Example.COM ', 'password123');

    assert.equal(result.user.email, user.email);
    await assert.doesNotReject(async () => verifyToken(result.token));
  } finally {
    prisma.user.findUnique = originalFindUnique;
  }
});

test('updatePassword rotates the session so old JWT stops working', async () => {
  const originalFindUnique = prisma.user.findUnique;
  const originalUpdate = prisma.user.update;
  const state = createMockUser({
    password: await bcrypt.hash('oldpass1', 4),
  });

  prisma.user.findUnique = (async (args: any) => {
    if (args.where.email === state.email || args.where.id === state.id) {
      return state;
    }

    return null;
  }) as unknown as typeof prisma.user.findUnique;

  prisma.user.update = (async (args: any) => {
    if (args.where.id !== state.id || !args.data.password) {
      throw new AppError('Unexpected update payload', 500);
    }

    state.password = args.data.password;
    return {
      id: state.id,
      email: state.email,
      name: state.name,
      createdAt: state.createdAt,
      updatedAt: new Date('2026-02-05T00:00:00.000Z'),
      password: state.password,
    };
  }) as unknown as typeof prisma.user.update;

  try {
    const { token: oldToken } = await login(state.email, 'oldpass1');
    await assert.doesNotReject(async () => verifyToken(oldToken));

    const { token: nextToken } = await updatePassword(state.id, 'oldpass1', 'newpass2');

    await assert.rejects(
      async () => verifyToken(oldToken),
      (error: unknown) => error instanceof AppError && error.message === 'Invalid or expired token',
    );
    await assert.doesNotReject(async () => verifyToken(nextToken));
  } finally {
    prisma.user.findUnique = originalFindUnique;
    prisma.user.update = originalUpdate;
  }
});

test('updateProfile trims passenger name before saving it', async () => {
  const originalUpdate = prisma.user.update;
  const recordedNames: string[] = [];

  prisma.user.update = (async (args: any) => {
    recordedNames.push(args.data.name);

    return {
      id: args.where.id,
      email: 'user@example.com',
      name: args.data.name,
      createdAt: new Date('2026-02-10T00:00:00.000Z'),
    };
  }) as unknown as typeof prisma.user.update;

  try {
    const result = await updateProfile('user-1', '  Yandex Air  ');

    assert.deepEqual(recordedNames, ['Yandex Air']);
    assert.equal(result.name, 'Yandex Air');
  } finally {
    prisma.user.update = originalUpdate;
  }
});
