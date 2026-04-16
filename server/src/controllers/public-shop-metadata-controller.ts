import type { Request, Response } from 'express';

import { prisma } from '../config/prisma.js';
import { AppError } from '../lib/app-error.js';
import { sendSuccess } from '../lib/http.js';
import { shopService } from '../services/shop-service.js';

export async function getShopBySlug(_req: Request, res: Response) {
  const { slug } = res.locals.validatedParams as { slug: string };

  const shop = await prisma.shop.findUnique({
    where: {
      slug
    },
    include: {
      serviceTypes: {
        where: {
          isActive: true
        },
        orderBy: {
          durationMinutes: 'asc'
        }
      },
      operatingHours: {
        orderBy: {
          dayOfWeek: 'asc'
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

  const isOpen = await shopService.checkIfShopIsOpen(shop.id);

  return sendSuccess(res, {
    id: shop.id,
    name: shop.name,
    slug: shop.slug,
    status: shop.status,
    timezone: shop.timezone,
    phone: shop.phone,
    address: shop.address,
    isOpen,
    serviceTypes: shop.serviceTypes,
    barbers: shop.barbers,
    operatingHours: shop.operatingHours
  });
}
