import { prisma } from '../config/prisma.js';
import { differenceInMinutes } from '../lib/time.js';

type QueueEntryWithService = {
  status: string;
  serviceType: {
    durationMinutes: number;
  };
  serviceTypeId: string;
  startedAt: Date | null;
};

export class WaitTimeEstimationService {
  async calculateEstimatedWaitTime(shopId: string, position?: number) {
    const queueSnapshot = await prisma.queueEntry.findMany({
      where: {
        shopId,
        status: {
          in: ['WAITING', 'IN_PROGRESS']
        }
      },
      include: {
        serviceType: true
      },
      orderBy: {
        position: 'asc'
      }
    });

    const activeBarbers = Math.max(
      await prisma.barber.count({
        where: {
          shopId,
          isActive: true
        }
      }),
      1
    );

    const waitingEntries = queueSnapshot.filter((entry) => entry.status === 'WAITING');

    if (waitingEntries.length === 0) {
      return 0;
    }

    const targetIndex =
      typeof position === 'number'
        ? Math.max(
            waitingEntries.findIndex((entry) => entry.position === position),
            waitingEntries.length - 1
          )
        : waitingEntries.length - 1;

    const inProgressRemaining = await this.getInProgressRemainingMinutes(shopId, queueSnapshot);
    let cumulativeMinutes = inProgressRemaining;

    for (let index = 0; index < waitingEntries.length; index += 1) {
      if (index === targetIndex) {
        return Math.max(0, Math.ceil(cumulativeMinutes / activeBarbers));
      }

      cumulativeMinutes += await this.getExpectedServiceDuration(
        shopId,
        waitingEntries[index].serviceTypeId,
        waitingEntries[index].serviceType.durationMinutes
      );
    }

    return Math.max(0, Math.ceil(cumulativeMinutes / activeBarbers));
  }

  async getHistoricalAverageWaitTime(shopId: string, serviceTypeId?: string, timeframeDays = 14) {
    const since = new Date();
    since.setDate(since.getDate() - timeframeDays);

    const completedEntries = await prisma.queueEntry.findMany({
      where: {
        shopId,
        serviceTypeId,
        status: 'COMPLETED',
        startedAt: {
          not: null
        },
        joinedAt: {
          gte: since
        }
      },
      select: {
        joinedAt: true,
        startedAt: true
      },
      take: 25,
      orderBy: {
        completedAt: 'desc'
      }
    });

    if (completedEntries.length === 0) {
      return 0;
    }

    const total = completedEntries.reduce((sum, entry) => {
      if (!entry.startedAt) {
        return sum;
      }

      return sum + differenceInMinutes(entry.startedAt, entry.joinedAt);
    }, 0);

    return Math.max(0, Math.round(total / completedEntries.length));
  }

  async getCurrentWaitForPosition(shopId: string, position: number) {
    return this.calculateEstimatedWaitTime(shopId, position);
  }

  async getExpectedServiceDuration(shopId: string, serviceTypeId: string, fallbackMinutes: number) {
    const recentEntries = await prisma.queueEntry.findMany({
      where: {
        shopId,
        serviceTypeId,
        status: 'COMPLETED',
        startedAt: {
          not: null
        },
        completedAt: {
          not: null
        }
      },
      select: {
        startedAt: true,
        completedAt: true
      },
      take: 10,
      orderBy: {
        completedAt: 'desc'
      }
    });

    if (recentEntries.length === 0) {
      return fallbackMinutes;
    }

    const total = recentEntries.reduce((sum, entry) => {
      if (!entry.startedAt || !entry.completedAt) {
        return sum;
      }

      return sum + differenceInMinutes(entry.completedAt, entry.startedAt);
    }, 0);

    return Math.max(5, Math.round(total / recentEntries.length));
  }

  async getInProgressRemainingForShop(shopId: string) {
    return this.getInProgressRemainingMinutes(shopId);
  }

  private async getInProgressRemainingMinutes(
    shopId: string,
    queueSnapshot?: QueueEntryWithService[]
  ) {
    const entries =
      queueSnapshot?.filter((entry) => entry.status === 'IN_PROGRESS') ??
      (await prisma.queueEntry.findMany({
        where: {
          shopId,
          status: 'IN_PROGRESS'
        },
        include: {
          serviceType: true
        }
      }));

    let totalRemaining = 0;

    for (const entry of entries) {
      const expectedDuration = await this.getExpectedServiceDuration(
        shopId,
        entry.serviceTypeId,
        entry.serviceType.durationMinutes
      );
      const elapsed = entry.startedAt ? differenceInMinutes(new Date(), entry.startedAt) : 0;
      totalRemaining += Math.max(expectedDuration - elapsed, 0);
    }

    return totalRemaining;
  }
}

export const waitTimeEstimationService = new WaitTimeEstimationService();
