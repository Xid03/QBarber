import { vi } from 'vitest';

const { prismaMock, getShopDetailsMock, checkIfShopIsOpenMock, emitQueueEventsMock } = vi.hoisted(
  () => ({
    prismaMock: {
      serviceType: {
        findFirst: vi.fn()
      },
      barber: {
        findFirst: vi.fn(),
        count: vi.fn()
      },
      customer: {
        create: vi.fn()
      },
      queueEntry: {
        count: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        findUnique: vi.fn()
      }
    },
    getShopDetailsMock: vi.fn(),
    checkIfShopIsOpenMock: vi.fn(),
    emitQueueEventsMock: vi.fn()
  })
);

vi.mock('../config/prisma.js', () => ({
  prisma: prismaMock
}));

vi.mock('./shop-service.js', () => ({
  shopService: {
    getShopDetails: getShopDetailsMock,
    checkIfShopIsOpen: checkIfShopIsOpenMock
  }
}));

vi.mock('../socket/queue-events.js', () => ({
  emitQueueEvents: emitQueueEventsMock
}));

vi.mock('./wait-time-estimation-service.js', () => ({
  waitTimeEstimationService: {
    getInProgressRemainingForShop: vi.fn().mockResolvedValue(0),
    getExpectedServiceDuration: vi.fn().mockResolvedValue(20),
    calculateEstimatedWaitTime: vi.fn().mockResolvedValue(18)
  }
}));

import { queueService } from './queue-service.js';

describe('QueueService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects queue joins when the shop is closed', async () => {
    getShopDetailsMock.mockResolvedValueOnce({ id: 'shop-1' });
    checkIfShopIsOpenMock.mockResolvedValueOnce(false);

    await expect(
      queueService.addToQueue('shop-1', {
        customerName: 'Aiman',
        serviceTypeId: 'svc-1'
      })
    ).rejects.toMatchObject({
      statusCode: 409,
      code: 'SHOP_CLOSED'
    });
  });

  it('creates a new queue entry and emits a joined event', async () => {
    getShopDetailsMock.mockResolvedValueOnce({ id: 'shop-1' });
    checkIfShopIsOpenMock.mockResolvedValueOnce(true);
    prismaMock.serviceType.findFirst.mockResolvedValueOnce({
      id: 'svc-1',
      durationMinutes: 30
    });
    prismaMock.customer.create.mockResolvedValueOnce({ id: 'cust-1' });
    prismaMock.queueEntry.count.mockResolvedValueOnce(2);
    prismaMock.queueEntry.create.mockResolvedValueOnce({
      id: 'entry-1',
      shopId: 'shop-1',
      serviceTypeId: 'svc-1',
      position: 3,
      status: 'WAITING',
      estimatedWaitMinutes: 0,
      joinedAt: new Date('2026-04-17T09:00:00.000Z'),
      startedAt: null,
      completedAt: null,
      customer: {
        name: 'Aiman',
        phone: null
      },
      serviceType: {
        name: 'Haircut',
        durationMinutes: 30
      },
      barber: null
    });

    vi.spyOn(queueService, 'updateQueuePosition').mockResolvedValueOnce(undefined);
    vi.spyOn(queueService, 'getEntryStatus').mockResolvedValueOnce({
      entry: {
        entryId: 'entry-1',
        customerName: 'Aiman',
        customerPhone: null,
        serviceTypeId: 'svc-1',
        serviceName: 'Haircut',
        position: 3,
        status: 'WAITING',
        estimatedWaitMinutes: 18,
        joinedAt: new Date('2026-04-17T09:00:00.000Z'),
        startedAt: null,
        completedAt: null,
        barberName: null
      },
      peopleAhead: []
    });
    vi.spyOn(queueService, 'getQueueStatus').mockResolvedValueOnce({
      shop: {
        id: 'shop-1',
        name: 'YZH Barber',
        status: 'OPEN',
        timezone: 'Asia/Kuala_Lumpur',
        phone: null,
        address: null
      },
      isOpen: true,
      currentQueue: 3,
      estimatedWait: 18,
      nowServing: null,
      busyLevel: 'LOW',
      queue: []
    });

    await expect(
      queueService.addToQueue('shop-1', {
        customerName: '  Aiman  ',
        serviceTypeId: 'svc-1'
      })
    ).resolves.toMatchObject({
      entry: {
        entryId: 'entry-1',
        position: 3
      }
    });

    expect(prismaMock.customer.create).toHaveBeenCalledWith({
      data: {
        name: 'Aiman',
        phone: null
      }
    });
    const createCalls = prismaMock.queueEntry.create.mock.calls as Array<
      [
        {
          data: {
            position: number;
          };
        }
      ]
    >;
    const createArgs = createCalls[0][0];
    expect(createArgs.data.position).toBe(3);
    expect(emitQueueEventsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        shopId: 'shop-1',
        lastAction: 'joined'
      })
    );
  });

  it('rejects queue joins when the selected service is unavailable', async () => {
    getShopDetailsMock.mockResolvedValueOnce({ id: 'shop-1' });
    checkIfShopIsOpenMock.mockResolvedValueOnce(true);
    prismaMock.serviceType.findFirst.mockResolvedValueOnce(null);

    await expect(
      queueService.addToQueue('shop-1', {
        customerName: 'Aiman',
        serviceTypeId: 'svc-missing'
      })
    ).rejects.toMatchObject({
      statusCode: 404,
      code: 'SERVICE_TYPE_NOT_FOUND'
    });
  });

  it('rejects starting a queue entry that is already in progress', async () => {
    prismaMock.queueEntry.findUnique.mockResolvedValueOnce({
      id: 'entry-1',
      shopId: 'shop-1',
      status: 'IN_PROGRESS'
    });

    await expect(queueService.markAsInProgress('entry-1')).rejects.toMatchObject({
      statusCode: 409,
      code: 'INVALID_QUEUE_STATE'
    });
  });

  it('starts a waiting entry with the first available barber when none is provided', async () => {
    prismaMock.queueEntry.findUnique.mockResolvedValueOnce({
      id: 'entry-1',
      shopId: 'shop-1',
      status: 'WAITING'
    });
    prismaMock.barber.findFirst.mockResolvedValueOnce({
      id: 'barber-1'
    });
    prismaMock.queueEntry.update.mockResolvedValueOnce({});

    vi.spyOn(queueService, 'updateQueuePosition').mockResolvedValueOnce(undefined);
    vi.spyOn(queueService, 'getEntryStatus').mockResolvedValueOnce({
      entry: {
        entryId: 'entry-1',
        customerName: 'Aiman',
        customerPhone: null,
        serviceTypeId: 'svc-1',
        serviceName: 'Haircut',
        position: 1,
        status: 'IN_PROGRESS',
        estimatedWaitMinutes: 0,
        joinedAt: new Date('2026-04-17T09:00:00.000Z'),
        startedAt: new Date('2026-04-17T09:05:00.000Z'),
        completedAt: null,
        barberName: 'Tony'
      },
      peopleAhead: []
    });
    vi.spyOn(queueService, 'getQueueStatus').mockResolvedValueOnce({
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
      estimatedWait: 12,
      nowServing: {
        entryId: 'entry-1',
        customerName: 'Aiman',
        service: 'Haircut',
        barberName: 'Tony'
      },
      busyLevel: 'LOW',
      queue: []
    });

    await expect(queueService.markAsInProgress('entry-1')).resolves.toMatchObject({
      entry: {
        entryId: 'entry-1',
        status: 'IN_PROGRESS'
      }
    });

    const updateCalls = prismaMock.queueEntry.update.mock.calls as Array<
      [
        {
          data: {
            status: string;
            barberId?: string | null;
            estimatedWaitMinutes: number;
            startedAt: Date;
          };
        }
      ]
    >;
    const updateArgs = updateCalls[0][0];
    expect(updateArgs.data.barberId).toBe('barber-1');
    expect(updateArgs.data.status).toBe('IN_PROGRESS');
    expect(updateArgs.data.estimatedWaitMinutes).toBe(0);
    expect(updateArgs.data.startedAt).toBeInstanceOf(Date);
    expect(emitQueueEventsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        shopId: 'shop-1',
        lastAction: 'started'
      })
    );
  });

  it('prevents completion when the queue entry is not in progress', async () => {
    prismaMock.queueEntry.findUnique.mockResolvedValueOnce({
      id: 'entry-1',
      shopId: 'shop-1',
      status: 'WAITING'
    });

    await expect(queueService.markAsCompleted('entry-1')).rejects.toMatchObject({
      statusCode: 409,
      code: 'INVALID_QUEUE_STATE'
    });
  });

  it('marks an in-progress entry as completed and refreshes the queue snapshot', async () => {
    prismaMock.queueEntry.findUnique.mockResolvedValueOnce({
      id: 'entry-1',
      shopId: 'shop-1',
      status: 'IN_PROGRESS'
    });
    prismaMock.queueEntry.update.mockResolvedValueOnce({});

    vi.spyOn(queueService, 'updateQueuePosition').mockResolvedValueOnce(undefined);
    vi.spyOn(queueService, 'getQueueStatus').mockResolvedValueOnce({
      shop: {
        id: 'shop-1',
        name: 'YZH Barber',
        status: 'OPEN',
        timezone: 'Asia/Kuala_Lumpur',
        phone: null,
        address: null
      },
      isOpen: true,
      currentQueue: 1,
      estimatedWait: 8,
      nowServing: null,
      busyLevel: 'LOW',
      queue: []
    });

    await queueService.markAsCompleted('entry-1');

    const updateCalls = prismaMock.queueEntry.update.mock.calls as Array<
      [
        {
          where: {
            id: string;
          };
          data: {
            status: string;
            estimatedWaitMinutes: number;
            completedAt: Date;
          };
        }
      ]
    >;
    const updateArgs = updateCalls[0][0];
    expect(updateArgs.where.id).toBe('entry-1');
    expect(updateArgs.data.status).toBe('COMPLETED');
    expect(updateArgs.data.estimatedWaitMinutes).toBe(0);
    expect(updateArgs.data.completedAt).toBeInstanceOf(Date);
    expect(emitQueueEventsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        shopId: 'shop-1',
        lastAction: 'completed'
      })
    );
  });

  it('delegates cancelEntry to removeFromQueue', async () => {
    const removeSpy = vi
      .spyOn(queueService, 'removeFromQueue')
      .mockResolvedValueOnce({ currentQueue: 1 } as never);

    await expect(queueService.cancelEntry('entry-1', 'Left shop')).resolves.toMatchObject({
      currentQueue: 1
    });

    expect(removeSpy).toHaveBeenCalledWith('entry-1', 'Left shop');
  });
});
