import type { Shop } from '@prisma/client';

import { prisma } from '../config/prisma.js';
import { AppError } from '../lib/app-error.js';
import { getLocalDayAndTime } from '../lib/time.js';

export class ShopService {
  async getShopDetails(shopId: string) {
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      include: {
        adminUsers: {
          orderBy: {
            createdAt: 'asc'
          }
        },
        operatingHours: {
          orderBy: {
            dayOfWeek: 'asc'
          }
        },
        serviceTypes: {
          where: {
            isActive: true
          },
          orderBy: {
            durationMinutes: 'asc'
          }
        },
        barbers: {
          where: {
            isActive: true
          },
          orderBy: {
            name: 'asc'
          }
        }
      }
    });

    if (!shop) {
      throw new AppError(404, 'SHOP_NOT_FOUND', 'Shop not found.');
    }

    return shop;
  }

  async updateShopStatus(shopId: string, isOpen: boolean) {
    return prisma.shop.update({
      where: { id: shopId },
      data: {
        status: isOpen ? 'OPEN' : 'CLOSED'
      }
    });
  }

  async getOperatingHours(shopId: string) {
    await this.ensureShopExists(shopId);

    return prisma.operatingHour.findMany({
      where: { shopId },
      orderBy: {
        dayOfWeek: 'asc'
      }
    });
  }

  async updateOperatingHours(
    shopId: string,
    operatingHours: Array<{
      id: string;
      dayOfWeek: number;
      opensAt: string;
      closesAt: string;
      isEnabled: boolean;
    }>
  ) {
    await this.ensureShopExists(shopId);

    const existingHours = await prisma.operatingHour.findMany({
      where: { shopId },
      select: {
        id: true,
        dayOfWeek: true
      }
    });

    const existingIds = new Set(existingHours.map((entry) => entry.id));

    for (const entry of operatingHours) {
      if (!existingIds.has(entry.id)) {
        throw new AppError(404, 'OPERATING_HOUR_NOT_FOUND', 'One or more operating hour entries could not be found.');
      }
    }

    const uniqueDays = new Set(operatingHours.map((entry) => entry.dayOfWeek));
    if (uniqueDays.size !== operatingHours.length) {
      throw new AppError(400, 'DUPLICATE_DAY', 'Each weekday can only be configured once.');
    }

    await prisma.$transaction(
      operatingHours.map((entry) =>
        prisma.operatingHour.update({
          where: { id: entry.id },
          data: {
            opensAt: entry.opensAt,
            closesAt: entry.closesAt,
            isEnabled: entry.isEnabled
          }
        })
      )
    );

    return this.getOperatingHours(shopId);
  }

  async checkIfShopIsOpen(shopOrId: string | Shop) {
    const shop =
      typeof shopOrId === 'string'
        ? await prisma.shop.findUnique({
            where: { id: shopOrId },
            include: { operatingHours: true }
          })
        : await prisma.shop.findUnique({
            where: { id: shopOrId.id },
            include: { operatingHours: true }
          });

    if (!shop) {
      throw new AppError(404, 'SHOP_NOT_FOUND', 'Shop not found.');
    }

    if (shop.status === 'CLOSED') {
      return false;
    }

    const { dayOfWeek, time } = getLocalDayAndTime(shop.timezone);
    const today = shop.operatingHours.find((entry) => entry.dayOfWeek === dayOfWeek);

    if (!today || !today.isEnabled) {
      return false;
    }

    return time >= today.opensAt && time <= today.closesAt;
  }

  async ensureShopExists(shopId: string) {
    const shop = await prisma.shop.findUnique({
      where: { id: shopId }
    });

    if (!shop) {
      throw new AppError(404, 'SHOP_NOT_FOUND', 'Shop not found.');
    }

    return shop;
  }
}

export const shopService = new ShopService();
