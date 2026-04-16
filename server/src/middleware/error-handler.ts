import { Prisma } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';

import { logger } from '../config/logger.js';
import { AppError } from '../lib/app-error.js';

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route not found: ${req.method} ${req.originalUrl}`
    }
  });
}

export function errorHandler(error: Error, _req: Request, res: Response, _next: NextFunction) {
  logger.error(error.message);

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message
      }
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return res.status(400).json({
      success: false,
      error: {
        code: error.code,
        message: 'Database request could not be completed.'
      }
    });
  }

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: error.message || 'Unexpected server error.'
    }
  });
}
