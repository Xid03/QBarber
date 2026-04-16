import { Router } from 'express';

import {
  getFullQueue,
  getPublicAnalytics,
  getQueueEntry,
  getShopStatus,
  joinQueue,
  leaveQueue
} from '../../controllers/public-shop-controller.js';
import { getShopBySlug } from '../../controllers/public-shop-metadata-controller.js';
import { asyncHandler } from '../../middleware/async-handler.js';
import { validateRequest } from '../../middleware/validate.js';
import {
  joinQueueSchema,
  queueEntryParamsSchema,
  shopSlugParamsSchema,
  shopParamsSchema
} from '../../validation/schemas.js';

export const publicShopRouter = Router();

publicShopRouter.get(
  '/by-slug/:slug',
  validateRequest({ params: shopSlugParamsSchema }),
  asyncHandler(getShopBySlug)
);

publicShopRouter.get(
  '/:shopId/status',
  validateRequest({ params: shopParamsSchema }),
  asyncHandler(getShopStatus)
);

publicShopRouter.get(
  '/:shopId/queue',
  validateRequest({ params: shopParamsSchema }),
  asyncHandler(getFullQueue)
);

publicShopRouter.post(
  '/:shopId/queue/join',
  validateRequest({ params: shopParamsSchema, body: joinQueueSchema }),
  asyncHandler(joinQueue)
);

publicShopRouter.get(
  '/:shopId/queue/:entryId',
  validateRequest({ params: queueEntryParamsSchema }),
  asyncHandler(getQueueEntry)
);

publicShopRouter.delete(
  '/:shopId/queue/:entryId',
  validateRequest({ params: queueEntryParamsSchema }),
  asyncHandler(leaveQueue)
);

publicShopRouter.get(
  '/:shopId/analytics/public',
  validateRequest({ params: shopParamsSchema }),
  asyncHandler(getPublicAnalytics)
);
