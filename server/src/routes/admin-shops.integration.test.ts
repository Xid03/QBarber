import request from 'supertest';

import { createApp } from '../app.js';

describe('admin shop routes integration', () => {
  it('protects the dashboard route when no bearer token is present', async () => {
    const response = await request(createApp()).get('/api/admin/shops/shop-1/dashboard');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Missing or invalid authorization header.'
      }
    });
  });
});
