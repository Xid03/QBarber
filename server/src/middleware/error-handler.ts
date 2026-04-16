import type { NextFunction, Request, Response } from 'express';

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
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: error.message || 'Unexpected server error.'
    }
  });
}
