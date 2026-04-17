import type { Prisma, QueueEntry } from '@prisma/client';

import { prisma } from '../config/prisma.js';
import { AppError } from '../lib/app-error.js';
import { emitQueueEvents } from '../socket/queue-events.js';

import { shopService } from './shop-service.js';
import { waitTimeEstimationService } from './wait-time-estimation-service.js';

type AddToQueueInput = {
  customerName: string;
  customerPhone?: string;
  serviceTypeId: string;
  barberId?: string;
};

type AnalyticsRange = 'today' | 'week' | 'last14days';

const activeStatuses: Array<QueueEntry['status']> = ['WAITING', 'IN_PROGRESS'];

const queueEntryInclude = {
  customer: true,
  serviceType: true,
  barber: true
} satisfies Prisma.QueueEntryInclude;

type QueueEntryWithRelations = Prisma.QueueEntryGetPayload<{
  include: typeof queueEntryInclude;
}>;

export class QueueService {
  async addToQueue(shopId: string, input: AddToQueueInput) {
    const shop = await shopService.getShopDetails(shopId);
    const isOpen = await shopService.checkIfShopIsOpen(shop);

    if (!isOpen) {
      throw new AppError(
        409,
        'SHOP_CLOSED',
        'The shop is currently closed and cannot accept queue joins.'
      );
    }

    const serviceType = await prisma.serviceType.findFirst({
      where: {
        id: input.serviceTypeId,
        shopId,
        isActive: true
      }
    });

    if (!serviceType) {
      throw new AppError(404, 'SERVICE_TYPE_NOT_FOUND', 'Selected service type is unavailable.');
    }

    if (input.barberId) {
      const barber = await prisma.barber.findFirst({
        where: {
          id: input.barberId,
          shopId,
          isActive: true
        }
      });

      if (!barber) {
        throw new AppError(404, 'BARBER_NOT_FOUND', 'Selected barber is unavailable.');
      }
    }

    const customer = await prisma.customer.create({
      data: {
        name: input.customerName.trim(),
        phone: input.customerPhone?.trim() || null
      }
    });

    const nextPosition =
      (await prisma.queueEntry.count({
        where: {
          shopId,
          status: {
            in: activeStatuses
          }
        }
      })) + 1;

    const entry = await prisma.queueEntry.create({
      data: {
        shopId,
        customerId: customer.id,
        serviceTypeId: serviceType.id,
        barberId: input.barberId,
        position: nextPosition,
        estimatedWaitMinutes: 0
      },
      include: queueEntryInclude
    });

    await this.updateQueuePosition(shopId);

    const [entryStatus, queueStatus] = await Promise.all([
      this.getEntryStatus(shopId, entry.id),
      this.getQueueStatus(shopId)
    ]);

    emitQueueEvents({
      shopId,
      queueStatus,
      lastAction: 'joined'
    });

    return entryStatus;
  }

  async removeFromQueue(entryId: string, reason: string) {
    const entry = await this.getQueueEntryOrThrow(entryId);

    if (!activeStatuses.includes(entry.status)) {
      throw new AppError(409, 'QUEUE_ENTRY_NOT_ACTIVE', 'Only active queue entries can be removed.');
    }

    await prisma.queueEntry.update({
      where: { id: entryId },
      data: {
        status: 'CANCELLED',
        removedReason: reason
      }
    });

    await this.updateQueuePosition(entry.shopId);

    const queueStatus = await this.getQueueStatus(entry.shopId);

    emitQueueEvents({
      shopId: entry.shopId,
      queueStatus,
      lastAction: 'left'
    });

    return queueStatus;
  }

  async updateQueuePosition(shopId: string, tx: Prisma.TransactionClient = prisma) {
    const inProgressEntries = await tx.queueEntry.findMany({
      where: {
        shopId,
        status: 'IN_PROGRESS'
      },
      include: {
        serviceType: true
      },
      orderBy: {
        startedAt: 'asc'
      }
    });

    const waitingEntries = await tx.queueEntry.findMany({
      where: {
        shopId,
        status: 'WAITING'
      },
      include: {
        serviceType: true
      },
      orderBy: {
        joinedAt: 'asc'
      }
    });

    const orderedEntries = [...inProgressEntries, ...waitingEntries];
    const activeBarbers = Math.max(
      await tx.barber.count({
        where: {
          shopId,
          isActive: true
        }
      }),
      1
    );
    let cumulativeWaitMinutes = await waitTimeEstimationService.getInProgressRemainingForShop(shopId);

    for (let index = 0; index < orderedEntries.length; index += 1) {
      const entry = orderedEntries[index];
      const nextPosition = index + 1;
      let estimatedWaitMinutes = 0;

      if (entry.status === 'WAITING') {
        estimatedWaitMinutes = Math.max(0, Math.ceil(cumulativeWaitMinutes / activeBarbers));
        cumulativeWaitMinutes += await waitTimeEstimationService.getExpectedServiceDuration(
          shopId,
          entry.serviceTypeId,
          entry.serviceType.durationMinutes
        );
      }

      await tx.queueEntry.update({
        where: { id: entry.id },
        data: {
          position: nextPosition,
          estimatedWaitMinutes
        }
      });
    }
  }

  async getQueueStatus(shopId: string) {
    const shop = await shopService.getShopDetails(shopId);
    const queueEntries = await prisma.queueEntry.findMany({
      where: {
        shopId,
        status: {
          in: activeStatuses
        }
      },
      include: queueEntryInclude,
      orderBy: {
        position: 'asc'
      }
    });

    const waitingEntries = queueEntries.filter((entry) => entry.status === 'WAITING');
    const inProgressEntry = queueEntries.find((entry) => entry.status === 'IN_PROGRESS') ?? null;
    const estimatedWaitForNewJoin = await waitTimeEstimationService.calculateEstimatedWaitTime(shopId);
    const activeBarbers = shop.barbers.length || 1;

    return {
      shop: {
        id: shop.id,
        name: shop.name,
        status: shop.status,
        timezone: shop.timezone,
        phone: shop.phone,
        address: shop.address
      },
      isOpen: await shopService.checkIfShopIsOpen(shop),
      currentQueue: waitingEntries.length,
      estimatedWait: estimatedWaitForNewJoin,
      nowServing: inProgressEntry
        ? {
            entryId: inProgressEntry.id,
            customerName: inProgressEntry.customer.name,
            service: inProgressEntry.serviceType.name,
            barberName: inProgressEntry.barber?.name ?? null
          }
        : null,
      busyLevel: this.getBusyLevel(waitingEntries.length, activeBarbers),
      queue: queueEntries.map((entry) => this.toQueueEntryResponse(entry))
    };
  }

  async getEntryStatus(shopId: string, entryId: string) {
    const entry = await prisma.queueEntry.findFirst({
      where: {
        id: entryId,
        shopId
      },
      include: queueEntryInclude
    });

    if (!entry) {
      throw new AppError(404, 'QUEUE_ENTRY_NOT_FOUND', 'Queue entry not found.');
    }

    const peopleAhead = await prisma.queueEntry.findMany({
      where: {
        shopId,
        status: {
          in: activeStatuses
        },
        position: {
          lt: entry.position
        }
      },
      include: queueEntryInclude,
      orderBy: {
        position: 'asc'
      }
    });

    return {
      entry: this.toQueueEntryResponse(entry),
      peopleAhead: peopleAhead.map((aheadEntry) => this.toQueueEntryResponse(aheadEntry))
    };
  }

  async markAsInProgress(entryId: string, barberId?: string) {
    const entry = await this.getQueueEntryOrThrow(entryId);

    if (entry.status !== 'WAITING') {
      throw new AppError(409, 'INVALID_QUEUE_STATE', 'Only waiting entries can be started.');
    }

    let resolvedBarberId = barberId;

    if (resolvedBarberId) {
      const barber = await prisma.barber.findFirst({
        where: {
          id: resolvedBarberId,
          shopId: entry.shopId,
          isActive: true
        }
      });

      if (!barber) {
        throw new AppError(404, 'BARBER_NOT_FOUND', 'Selected barber is unavailable.');
      }
    } else {
      const availableBarber = await prisma.barber.findFirst({
        where: {
          shopId: entry.shopId,
          isActive: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      resolvedBarberId = availableBarber?.id;
    }

    await prisma.queueEntry.update({
      where: {
        id: entryId
      },
      data: {
        status: 'IN_PROGRESS',
        barberId: resolvedBarberId,
        startedAt: new Date(),
        estimatedWaitMinutes: 0
      }
    });

    await this.updateQueuePosition(entry.shopId);

    const [entryStatus, queueStatus] = await Promise.all([
      this.getEntryStatus(entry.shopId, entryId),
      this.getQueueStatus(entry.shopId)
    ]);

    emitQueueEvents({
      shopId: entry.shopId,
      queueStatus,
      lastAction: 'started'
    });

    return entryStatus;
  }

  async markAsCompleted(entryId: string) {
    const entry = await this.getQueueEntryOrThrow(entryId);

    if (entry.status !== 'IN_PROGRESS') {
      throw new AppError(409, 'INVALID_QUEUE_STATE', 'Only in-progress entries can be completed.');
    }

    await prisma.queueEntry.update({
      where: {
        id: entryId
      },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        estimatedWaitMinutes: 0
      }
    });

    await this.updateQueuePosition(entry.shopId);

    const queueStatus = await this.getQueueStatus(entry.shopId);

    emitQueueEvents({
      shopId: entry.shopId,
      queueStatus,
      lastAction: 'completed'
    });

    return queueStatus;
  }

  async cancelEntry(entryId: string, reason: string) {
    return this.removeFromQueue(entryId, reason);
  }

  async getDashboardStats(shopId: string) {
    await shopService.ensureShopExists(shopId);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [queueStatus, completedToday, activeQueueCount] = await Promise.all([
      this.getQueueStatus(shopId),
      prisma.queueEntry.findMany({
        where: {
          shopId,
          status: 'COMPLETED',
          completedAt: {
            gte: todayStart
          }
        },
        include: {
          serviceType: true
        }
      }),
      prisma.queueEntry.count({
        where: {
          shopId,
          status: {
            in: activeStatuses
          }
        }
      })
    ]);

    const averageWaitMin =
      completedToday.length === 0
        ? 0
        : Math.round(
            completedToday.reduce((sum, item) => sum + item.estimatedWaitMinutes, 0) /
              completedToday.length
          );

    const revenueEstimateCents = completedToday.reduce(
      (sum, item) => sum + item.serviceType.priceCents,
      0
    );

    return {
      stats: {
        servedCount: completedToday.length,
        averageWaitMin,
        inQueue: activeQueueCount,
        revenueEstimateCents
      },
      liveQueue: queueStatus.queue.slice(0, 5),
      nowServing: queueStatus.nowServing,
      busyLevel: queueStatus.busyLevel
    };
  }

  async getDetailedAnalytics(shopId: string, range: AnalyticsRange = 'last14days') {
    await shopService.ensureShopExists(shopId);

    const since = this.getAnalyticsRangeStart(range);

    const entries = await prisma.queueEntry.findMany({
      where: {
        shopId,
        joinedAt: {
          gte: since
        }
      },
      include: {
        serviceType: true
      }
    });

    const servicePopularity = entries.reduce<Record<string, number>>((acc, entry) => {
      acc[entry.serviceType.name] = (acc[entry.serviceType.name] ?? 0) + 1;
      return acc;
    }, {});

    const hourlyTraffic = entries.reduce<Record<string, number>>((acc, entry) => {
      const hour = entry.joinedAt.getHours().toString().padStart(2, '0');
      acc[hour] = (acc[hour] ?? 0) + 1;
      return acc;
    }, {});

    const averageWaitMin = await waitTimeEstimationService.getHistoricalAverageWaitTime(shopId);

    return {
      averageWaitMin,
      servicePopularity: Object.entries(servicePopularity).map(([service, count]) => ({
        service,
        count
      })),
      hourlyTraffic: Object.entries(hourlyTraffic)
        .sort(([hourA], [hourB]) => hourA.localeCompare(hourB))
        .map(([hour, count]) => ({
          hour,
          count
        }))
    };
  }

  async getPublicAnalytics(shopId: string) {
    const analytics = await this.getDetailedAnalytics(shopId);
    const bestTimes = [...analytics.hourlyTraffic].sort((a, b) => a.count - b.count).slice(0, 3);
    const peakHours = [...analytics.hourlyTraffic].sort((a, b) => b.count - a.count).slice(0, 3);

    return {
      averageWaitMinutes: analytics.averageWaitMin,
      peakHours,
      bestTimesToVisit: bestTimes
    };
  }

  private async getQueueEntryOrThrow(entryId: string) {
    const entry = await prisma.queueEntry.findUnique({
      where: {
        id: entryId
      }
    });

    if (!entry) {
      throw new AppError(404, 'QUEUE_ENTRY_NOT_FOUND', 'Queue entry not found.');
    }

    return entry;
  }

  private toQueueEntryResponse(entry: QueueEntryWithRelations) {
    return {
      entryId: entry.id,
      customerName: entry.customer.name,
      customerPhone: entry.customer.phone,
      serviceTypeId: entry.serviceTypeId,
      serviceName: entry.serviceType.name,
      position: entry.position,
      status: entry.status,
      estimatedWaitMinutes: entry.estimatedWaitMinutes,
      joinedAt: entry.joinedAt,
      startedAt: entry.startedAt,
      completedAt: entry.completedAt,
      barberName: entry.barber?.name ?? null
    };
  }

  private getBusyLevel(queueLength: number, activeBarbers: number) {
    const ratio = queueLength / Math.max(activeBarbers, 1);

    if (ratio >= 4) {
      return 'HIGH';
    }

    if (ratio >= 2) {
      return 'MEDIUM';
    }

    return 'LOW';
  }

  private getAnalyticsRangeStart(range: AnalyticsRange) {
    const now = new Date();

    if (range === 'today') {
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    if (range === 'week') {
      const currentDay = now.getDay();
      const diffToMonday = currentDay === 0 ? 6 : currentDay - 1;
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - diffToMonday);
      weekStart.setHours(0, 0, 0, 0);
      return weekStart;
    }

    const last14DaysStart = new Date(now);
    last14DaysStart.setDate(now.getDate() - 13);
    last14DaysStart.setHours(0, 0, 0, 0);
    return last14DaysStart;
  }
}

export const queueService = new QueueService();
