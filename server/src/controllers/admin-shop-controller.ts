import type { Request, Response } from 'express';

import { sendSuccess } from '../lib/http.js';
import { queueService } from '../services/queue-service.js';
import { shopService } from '../services/shop-service.js';

export async function getDashboard(_req: Request, res: Response) {
  const { shopId } = res.locals.validatedParams as { shopId: string };
  const dashboard = await queueService.getDashboardStats(shopId);

  return sendSuccess(res, dashboard);
}

export async function startQueueEntry(_req: Request, res: Response) {
  const { shopId, entryId } = res.locals.validatedParams as { shopId: string; entryId: string };
  const input = (res.locals.validatedBody ?? {}) as { barberId?: string };
  const result = await queueService.markAsInProgress(entryId, input.barberId);

  return sendSuccess(res, { shopId, ...result }, 'Service started.');
}

export async function completeQueueEntry(_req: Request, res: Response) {
  const { entryId } = res.locals.validatedParams as { shopId: string; entryId: string };
  const result = await queueService.markAsCompleted(entryId);

  return sendSuccess(res, result, 'Service completed.');
}

export async function cancelQueueEntry(_req: Request, res: Response) {
  const { entryId } = res.locals.validatedParams as { shopId: string; entryId: string };
  const input = (res.locals.validatedBody ?? {}) as { reason?: string };
  const result = await queueService.cancelEntry(entryId, input.reason ?? 'Cancelled by admin.');

  return sendSuccess(res, result, 'Queue entry cancelled.');
}

export async function manualAddQueueEntry(_req: Request, res: Response) {
  const { shopId } = res.locals.validatedParams as { shopId: string };
  const input = res.locals.validatedBody as {
    customerName: string;
    customerPhone?: string;
    serviceTypeId: string;
    barberId?: string;
  };
  const result = await queueService.addToQueue(shopId, input);

  return sendSuccess(res, result, 'Customer added to queue.', 201);
}

export async function getDetailedAnalytics(_req: Request, res: Response) {
  const { shopId } = res.locals.validatedParams as { shopId: string };
  const analytics = await queueService.getDetailedAnalytics(shopId);

  return sendSuccess(res, analytics);
}

export async function getShopSettings(_req: Request, res: Response) {
  const { shopId } = res.locals.validatedParams as { shopId: string };
  const shop = await shopService.getShopDetails(shopId);

  return sendSuccess(res, {
    id: shop.id,
    name: shop.name,
    slug: shop.slug,
    status: shop.status,
    timezone: shop.timezone,
    phone: shop.phone,
    address: shop.address,
    serviceTypes: shop.serviceTypes,
    barbers: shop.barbers,
    operatingHours: shop.operatingHours
  });
}

export async function updateShopStatus(_req: Request, res: Response) {
  const { shopId } = res.locals.validatedParams as { shopId: string };
  const { isOpen } = res.locals.validatedBody as { isOpen: boolean };
  const shop = await shopService.updateShopStatus(shopId, isOpen);

  return sendSuccess(
    res,
    {
      id: shop.id,
      status: shop.status
    },
    `Shop marked as ${isOpen ? 'open' : 'closed'}.`
  );
}
