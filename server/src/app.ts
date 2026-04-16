import cors from 'cors';
import express from 'express';

import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { adminAuthRouter } from './routes/admin/auth.js';
import { adminShopRouter } from './routes/admin/shops.js';
import { publicShopRouter } from './routes/public/shops.js';

export function createApp() {
  const app = express();
  const allowedOrigins = env.CLIENT_URL.split(',').map((origin) => origin.trim());

  app.use(
    cors({
      origin: allowedOrigins
    })
  );
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({
      success: true,
      message: 'QFlow server is running.',
      data: {
        environment: env.NODE_ENV
      }
    });
  });

  app.use('/api/shops', publicShopRouter);
  app.use('/api/admin/auth', adminAuthRouter);
  app.use('/api/admin/shops', adminShopRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
