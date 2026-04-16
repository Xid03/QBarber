import type { Shop } from '@prisma/client';

import { prisma } from '../config/prisma.js';
import { AppError } from '../lib/app-error.js';
import { getLocalDayAndTime } from '../lib/time.js';

export class ShopService {
  async getShopDetails(shopId: string) {
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      include: {
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
