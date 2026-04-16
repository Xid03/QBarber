import { Router } from 'express';

import {
  cancelQueueEntry,
  completeQueueEntry,
  getDashboard,
  getDetailedAnalytics,
  getShopSettings,
  manualAddQueueEntry,
  startQueueEntry,
  updateShopStatus
} from '../../controllers/admin-shop-controller.js';
import { asyncHandler } from '../../middleware/async-handler.js';
import { requireAdminAuth } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';
import {
  cancelQueueSchema,
  joinQueueSchema,
  queueEntryParamsSchema,
  shopStatusSchema,
  shopParamsSchema,
  startQueueSchema
} from '../../validation/schemas.js';

export const adminShopRouter = Router();

adminShopRouter.use(requireAdminAuth);

adminShopRouter.get(
  '/:shopId/dashboard',
  validateRequest({ params: shopParamsSchema }),
  asyncHandler(getDashboard)
);

adminShopRouter.put(
  '/:shopId/queue/:entryId/start',
  validateRequest({ params: queueEntryParamsSchema, body: startQueueSchema }),
  asyncHandler(startQueueEntry)
);

adminShopRouter.put(
  '/:shopId/queue/:entryId/complete',
  validateRequest({ params: queueEntryParamsSchema }),
  asyncHandler(completeQueueEntry)
);

adminShopRouter.put(
  '/:shopId/queue/:entryId/cancel',
  validateRequest({ params: queueEntryParamsSchema, body: cancelQueueSchema }),
  asyncHandler(cancelQueueEntry)
);

adminShopRouter.post(
  '/:shopId/queue/manual-add',
  validateRequest({ params: shopParamsSchema, body: joinQueueSchema }),
  asyncHandler(manualAddQueueEntry)
);

adminShopRouter.get(
  '/:shopId/analytics/detailed',
  validateRequest({ params: shopParamsSchema }),
  asyncHandler(getDetailedAnalytics)
);

adminShopRouter.get(
  '/:shopId/settings',
  validateRequest({ params: shopParamsSchema }),
  asyncHandler(getShopSettings)
);

adminShopRouter.put(
  '/:shopId/status',
  validateRequest({ params: shopParamsSchema, body: shopStatusSchema }),
  asyncHandler(updateShopStatus)
);
