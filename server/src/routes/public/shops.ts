import { Router } from 'express';

export const publicShopRouter = Router();

publicShopRouter.get('/:shopId/status', (_req, res) => {
  res.json({ message: 'TODO: GET /api/shops/:shopId/status' });
});

publicShopRouter.get('/:shopId/queue', (_req, res) => {
  res.json({ message: 'TODO: GET /api/shops/:shopId/queue' });
});

publicShopRouter.post('/:shopId/queue/join', (_req, res) => {
  res.status(202).json({ message: 'TODO: POST /api/shops/:shopId/queue/join' });
});

publicShopRouter.get('/:shopId/queue/:entryId', (_req, res) => {
  res.json({ message: 'TODO: GET /api/shops/:shopId/queue/:entryId' });
});

publicShopRouter.delete('/:shopId/queue/:entryId', (_req, res) => {
  res.json({ message: 'TODO: DELETE /api/shops/:shopId/queue/:entryId' });
});

publicShopRouter.get('/:shopId/analytics/public', (_req, res) => {
  res.json({ message: 'TODO: GET /api/shops/:shopId/analytics/public' });
});
