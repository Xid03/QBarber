import { Router } from 'express';

import {
  cancelQueueEntry,
  deleteAdminUser,
  completeQueueEntry,
  createAdminUser,
  updateAdminUser,
  getDashboard,
  getDetailedAnalytics,
  getShopSettings,
  updateOperatingHours,
  updateServiceType,
  manualAddQueueEntry,
  startQueueEntry,
  toggleAdminUserStatus,
  updateShopStatus
} from '../../controllers/admin-shop-controller.js';
import { asyncHandler } from '../../middleware/async-handler.js';
import { requireAdminAuth } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';
import {
  adminUserParamsSchema,
  adminUserStatusSchema,
  analyticsRangeQuerySchema,
  cancelQueueSchema,
  createAdminUserSchema,
  joinQueueSchema,
  queueEntryParamsSchema,
  shopStatusSchema,
  serviceTypeParamsSchema,
  updateOperatingHoursSchema,
  updateAdminUserSchema,
  updateServiceTypeSchema,
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
  validateRequest({ params: shopParamsSchema, query: analyticsRangeQuerySchema }),
  asyncHandler(getDetailedAnalytics)
);

adminShopRouter.get(
  '/:shopId/settings',
  validateRequest({ params: shopParamsSchema }),
  asyncHandler(getShopSettings)
);

adminShopRouter.put(
  '/:shopId/operating-hours',
  validateRequest({ params: shopParamsSchema, body: updateOperatingHoursSchema }),
  asyncHandler(updateOperatingHours)
);

adminShopRouter.post(
  '/:shopId/admin-users',
  validateRequest({ params: shopParamsSchema, body: createAdminUserSchema }),
  asyncHandler(createAdminUser)
);

adminShopRouter.put(
  '/:shopId/admin-users/:adminUserId',
  validateRequest({ params: adminUserParamsSchema, body: updateAdminUserSchema }),
  asyncHandler(updateAdminUser)
);

adminShopRouter.put(
  '/:shopId/admin-users/:adminUserId/status',
  validateRequest({ params: adminUserParamsSchema, body: adminUserStatusSchema }),
  asyncHandler(toggleAdminUserStatus)
);

adminShopRouter.delete(
  '/:shopId/admin-users/:adminUserId',
  validateRequest({ params: adminUserParamsSchema }),
  asyncHandler(deleteAdminUser)
);

adminShopRouter.put(
  '/:shopId/status',
  validateRequest({ params: shopParamsSchema, body: shopStatusSchema }),
  asyncHandler(updateShopStatus)
);

adminShopRouter.put(
  '/:shopId/service-types/:serviceTypeId',
  validateRequest({ params: serviceTypeParamsSchema, body: updateServiceTypeSchema }),
  asyncHandler(updateServiceType)
);
