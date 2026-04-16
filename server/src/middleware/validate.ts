import type { NextFunction, Request, Response } from 'express';
import { ZodError, type ZodTypeAny } from 'zod';

import { AppError } from '../lib/app-error.js';

type ValidationConfig = {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
};

export function validateRequest(config: ValidationConfig) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const locals = res.locals as {
        validatedParams?: unknown;
        validatedQuery?: unknown;
        validatedBody?: unknown;
      };

      if (config.params) {
        locals.validatedParams = config.params.parse(req.params) as unknown;
      }

      if (config.query) {
        locals.validatedQuery = config.query.parse(req.query) as unknown;
      }

      if (config.body) {
        locals.validatedBody = config.body.parse(req.body) as unknown;
      }

      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(
          new AppError(
            400,
            'VALIDATION_ERROR',
            error.issues.map((issue) => issue.message).join('; ')
          )
        );
      }

      return next(error);
    }
  };
}
