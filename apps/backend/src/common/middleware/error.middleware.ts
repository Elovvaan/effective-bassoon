import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

import { AppError } from '../errors/app-error.js';

export const errorMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof ZodError) {
    res.status(400).json({
      message: 'Validation failed',
      issues: err.issues,
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      message: err.message,
      details: err.details,
    });
    return;
  }

  res.status(500).json({
    message: 'Internal server error',
  });
};
