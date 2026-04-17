import { vi } from 'vitest';

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    queueEntry: {
      findMany: vi.fn()
    },
    barber: {
      count: vi.fn()
    }
  }
}));

vi.mock('../config/prisma.js', () => ({
  prisma: prismaMock
}));

import { waitTimeEstimationService } from './wait-time-estimation-service.js';

describe('WaitTimeEstimationService', () => {
  beforeEach(() => {
    prismaMock.queueEntry.findMany.mockReset();
    prismaMock.barber.count.mockReset();
  });

  it('returns zero when nobody is waiting', async () => {
    prismaMock.queueEntry.findMany.mockResolvedValueOnce([]);
    prismaMock.barber.count.mockResolvedValueOnce(2);

    await expect(waitTimeEstimationService.calculateEstimatedWaitTime('shop-1')).resolves.toBe(0);
  });

  it('computes the average historical wait from recent completed entries', async () => {
    prismaMock.queueEntry.findMany.mockResolvedValueOnce([
      {
        joinedAt: new Date('2026-04-17T09:00:00.000Z'),
        startedAt: new Date('2026-04-17T09:12:00.000Z')
      },
      {
        joinedAt: new Date('2026-04-17T10:00:00.000Z'),
        startedAt: new Date('2026-04-17T10:18:00.000Z')
      }
    ]);

    await expect(waitTimeEstimationService.getHistoricalAverageWaitTime('shop-1')).resolves.toBe(15);
  });

  it('falls back to the service duration when no recent completions exist', async () => {
    prismaMock.queueEntry.findMany.mockResolvedValueOnce([]);

    await expect(
      waitTimeEstimationService.getExpectedServiceDuration('shop-1', 'svc-1', 35)
    ).resolves.toBe(35);
  });

  it('delegates current wait lookups to the position-based estimate calculation', async () => {
    const estimateSpy = vi
      .spyOn(waitTimeEstimationService, 'calculateEstimatedWaitTime')
      .mockResolvedValueOnce(22);

    await expect(waitTimeEstimationService.getCurrentWaitForPosition('shop-1', 3)).resolves.toBe(22);

    expect(estimateSpy).toHaveBeenCalledWith('shop-1', 3);
  });

  it('returns zero historical wait when there is no completed history', async () => {
    prismaMock.queueEntry.findMany.mockResolvedValueOnce([]);

    await expect(waitTimeEstimationService.getHistoricalAverageWaitTime('shop-1')).resolves.toBe(0);
  });

  it('averages recent completed durations for expected service time', async () => {
    prismaMock.queueEntry.findMany.mockResolvedValueOnce([
      {
        startedAt: new Date('2026-04-17T09:00:00.000Z'),
        completedAt: new Date('2026-04-17T09:28:00.000Z')
      },
      {
        startedAt: new Date('2026-04-17T10:00:00.000Z'),
        completedAt: new Date('2026-04-17T10:22:00.000Z')
      }
    ]);

    await expect(
      waitTimeEstimationService.getExpectedServiceDuration('shop-1', 'svc-1', 35)
    ).resolves.toBe(25);
  });

  it('calculates wait for the final waiting position using active barber capacity', async () => {
    prismaMock.queueEntry.findMany.mockResolvedValueOnce([
      {
        position: 1,
        status: 'IN_PROGRESS',
        serviceTypeId: 'svc-1',
        startedAt: new Date('2026-04-17T10:00:00.000Z'),
        serviceType: {
          durationMinutes: 30
        }
      },
      {
        position: 2,
        status: 'WAITING',
        serviceTypeId: 'svc-1',
        startedAt: null,
        serviceType: {
          durationMinutes: 30
        }
      },
      {
        position: 3,
        status: 'WAITING',
        serviceTypeId: 'svc-2',
        startedAt: null,
        serviceType: {
          durationMinutes: 20
        }
      }
    ]);
    prismaMock.barber.count.mockResolvedValueOnce(2);

    const durationSpy = vi
      .spyOn(waitTimeEstimationService, 'getExpectedServiceDuration')
      .mockResolvedValue(30);

    await expect(waitTimeEstimationService.calculateEstimatedWaitTime('shop-1')).resolves.toBe(30);

    expect(durationSpy).toHaveBeenNthCalledWith(1, 'shop-1', 'svc-1', 30);
    expect(durationSpy).toHaveBeenNthCalledWith(2, 'shop-1', 'svc-1', 30);
  });
});
