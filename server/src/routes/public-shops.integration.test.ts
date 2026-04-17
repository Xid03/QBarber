import request from 'supertest';
import { vi } from 'vitest';

const { queueServiceMock } = vi.hoisted(() => ({
  queueServiceMock: {
    getQueueStatus: vi.fn(),
    addToQueue: vi.fn(),
    getEntryStatus: vi.fn(),
    removeFromQueue: vi.fn(),
    getPublicAnalytics: vi.fn()
  }
}));

vi.mock('../services/queue-service.js', () => ({
  queueService: queueServiceMock
}));

vi.mock('../services/shop-service.js', () => ({
  shopService: {
    getShopDetails: vi.fn(),
    checkIfShopIsOpen: vi.fn(),
    ensureShopExists: vi.fn()
  }
}));

import { createApp } from '../app.js';

describe('public shop routes integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the live queue payload', async () => {
    queueServiceMock.getQueueStatus.mockResolvedValueOnce({
      shop: {
        id: 'shop-1',
        name: 'YZH Barber',
        status: 'OPEN',
        timezone: 'Asia/Kuala_Lumpur',
        phone: null,
        address: null
      },
      isOpen: true,
      currentQueue: 2,
      estimatedWait: 15,
      nowServing: null,
      busyLevel: 'LOW',
      queue: []
    });

    const response = await request(createApp()).get('/api/shops/shop-1/queue');
    const body = response.body as {
      data: {
        currentQueue: number;
      };
    };

    expect(response.status).toBe(200);
    expect(body.data.currentQueue).toBe(2);
  });

  it('joins the queue and returns the created entry snapshot', async () => {
    queueServiceMock.addToQueue.mockResolvedValueOnce({
      entry: {
        entryId: 'entry-1',
        customerName: 'Alya',
        customerPhone: null,
        serviceTypeId: 'svc-1',
        serviceName: 'Haircut',
        position: 3,
        status: 'WAITING',
        estimatedWaitMinutes: 12,
        joinedAt: '2026-04-17T09:00:00.000Z',
        startedAt: null,
        completedAt: null,
        barberName: null
      },
      peopleAhead: []
    });

    const response = await request(createApp()).post('/api/shops/shop-1/queue/join').send({
      customerName: 'Alya',
      serviceTypeId: 'svc-1'
    });
    const body = response.body as {
      message: string;
    };

    expect(response.status).toBe(201);
    expect(queueServiceMock.addToQueue).toHaveBeenCalledWith('shop-1', {
      customerName: 'Alya',
      serviceTypeId: 'svc-1'
    });
    expect(body.message).toBe('Joined queue successfully.');
  });

  it('rejects invalid queue join payloads before hitting the service layer', async () => {
    const response = await request(createApp()).post('/api/shops/shop-1/queue/join').send({
      customerName: 'A',
      serviceTypeId: ''
    });
    const body = response.body as {
      error: {
        code: string;
      };
    };

    expect(response.status).toBe(400);
    expect(queueServiceMock.addToQueue).not.toHaveBeenCalled();
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });
});
