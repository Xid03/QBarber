import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';
import { AppError } from '../lib/app-error.js';

type AdminTokenPayload = {
  sub: string;
  shopId: string;
  username: string;
  role: string;
};

export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    return next(new AppError(401, 'UNAUTHORIZED', 'Missing or invalid authorization header.'));
  }

  try {
    const token = header.replace('Bearer ', '');
    const payload = jwt.verify(token, env.JWT_SECRET) as AdminTokenPayload;
    res.locals.admin = payload;

    if (req.params.shopId && req.params.shopId !== payload.shopId) {
      return next(new AppError(403, 'FORBIDDEN', 'You are not allowed to access this shop.'));
    }

    return next();
  } catch {
    return next(new AppError(401, 'UNAUTHORIZED', 'Your session is invalid or has expired.'));
  }
}
