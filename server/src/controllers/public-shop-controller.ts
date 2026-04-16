import type { Request, Response } from 'express';

import { sendSuccess } from '../lib/http.js';
import { queueService } from '../services/queue-service.js';

export async function getShopStatus(_req: Request, res: Response) {
  const { shopId } = res.locals.validatedParams as { shopId: string };
  const queueStatus = await queueService.getQueueStatus(shopId);

  return sendSuccess(
    res,
    {
      isOpen: queueStatus.isOpen,
      currentQueue: queueStatus.currentQueue,
      estimatedWait: queueStatus.estimatedWait,
      nowServing: queueStatus.nowServing,
      busyLevel: queueStatus.busyLevel,
      shop: queueStatus.shop
    }
  );
}

export async function getFullQueue(_req: Request, res: Response) {
  const { shopId } = res.locals.validatedParams as { shopId: string };
  const queueStatus = await queueService.getQueueStatus(shopId);

  return sendSuccess(res, queueStatus);
}

export async function joinQueue(_req: Request, res: Response) {
  const { shopId } = res.locals.validatedParams as { shopId: string };
  const input = res.locals.validatedBody as {
    customerName: string;
    customerPhone?: string;
    serviceTypeId: string;
    barberId?: string;
  };
  const entryStatus = await queueService.addToQueue(shopId, input);

  return sendSuccess(res, entryStatus, 'Joined queue successfully.', 201);
}

export async function getQueueEntry(_req: Request, res: Response) {
  const { shopId, entryId } = res.locals.validatedParams as { shopId: string; entryId: string };
  const entryStatus = await queueService.getEntryStatus(shopId, entryId);

  return sendSuccess(res, entryStatus);
}

export async function leaveQueue(_req: Request, res: Response) {
  const { entryId } = res.locals.validatedParams as { shopId: string; entryId: string };
  const queueStatus = await queueService.removeFromQueue(entryId, 'Removed by customer.');

  return sendSuccess(res, queueStatus, 'Queue entry removed.');
}

export async function getPublicAnalytics(_req: Request, res: Response) {
  const { shopId } = res.locals.validatedParams as { shopId: string };
  const analytics = await queueService.getPublicAnalytics(shopId);

  return sendSuccess(res, analytics);
}
