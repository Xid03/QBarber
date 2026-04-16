import { Router } from 'express';

export const adminShopRouter = Router();

adminShopRouter.get('/:shopId/dashboard', (_req, res) => {
  res.json({ message: 'TODO: GET /api/admin/shops/:shopId/dashboard' });
});

adminShopRouter.put('/:shopId/queue/:entryId/start', (_req, res) => {
  res.json({ message: 'TODO: PUT /api/admin/shops/:shopId/queue/:entryId/start' });
});

adminShopRouter.put('/:shopId/queue/:entryId/complete', (_req, res) => {
  res.json({ message: 'TODO: PUT /api/admin/shops/:shopId/queue/:entryId/complete' });
});

adminShopRouter.put('/:shopId/queue/:entryId/cancel', (_req, res) => {
  res.json({ message: 'TODO: PUT /api/admin/shops/:shopId/queue/:entryId/cancel' });
});

adminShopRouter.post('/:shopId/queue/manual-add', (_req, res) => {
  res.json({ message: 'TODO: POST /api/admin/shops/:shopId/queue/manual-add' });
});

adminShopRouter.get('/:shopId/analytics/detailed', (_req, res) => {
  res.json({ message: 'TODO: GET /api/admin/shops/:shopId/analytics/detailed' });
});
