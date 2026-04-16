import { Router } from 'express';

export const adminAuthRouter = Router();

adminAuthRouter.post('/login', (_req, res) => {
  res.json({ message: 'TODO: POST /api/admin/auth/login' });
});
