import bcrypt from 'bcryptjs';
import request from 'supertest';
import { vi } from 'vitest';

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    adminUser: {
      findUnique: vi.fn()
    }
  }
}));

vi.mock('../config/prisma.js', () => ({
  prisma: prismaMock
}));

import { createApp } from '../app.js';

describe('admin auth integration', () => {
  beforeEach(() => {
    prismaMock.adminUser.findUnique.mockReset();
  });

  it('returns a token for valid admin credentials', async () => {
    prismaMock.adminUser.findUnique.mockResolvedValueOnce({
      id: 'admin-1',
      shopId: 'shop-1',
      username: 'admin',
      displayName: 'Owner',
      role: 'ADMIN',
      passwordHash: await bcrypt.hash('password', 8),
      shop: {
        id: 'shop-1',
        name: 'YZH Barber'
      }
    });

    const response = await request(createApp()).post('/api/admin/auth/login').send({
      username: 'admin',
      password: 'password'
    });
    const body = response.body as {
      success: boolean;
      data: {
        token: string;
        shop: {
          name: string;
        };
      };
    };

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.token).toEqual(expect.any(String));
    expect(body.data.shop.name).toBe('YZH Barber');
  });

  it('rejects invalid credentials', async () => {
    prismaMock.adminUser.findUnique.mockResolvedValueOnce({
      id: 'admin-1',
      shopId: 'shop-1',
      username: 'admin',
      displayName: 'Owner',
      role: 'ADMIN',
      passwordHash: await bcrypt.hash('password', 8),
      shop: {
        id: 'shop-1',
        name: 'YZH Barber'
      }
    });

    const response = await request(createApp()).post('/api/admin/auth/login').send({
      username: 'admin',
      password: 'wrong-password'
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid username or password.'
      }
    });
  });

  it('returns 400 when login input is malformed', async () => {
    const response = await request(createApp()).post('/api/admin/auth/login').send({
      username: 'ad',
      password: '123'
    });
    const body = response.body as {
      error: {
        code: string;
      };
    };

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });
});
