import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError.js';
import { logger } from '../config/logger.js';
import { sendError } from '../utils/response.js';
import { Prisma } from '@prisma/client';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const correlationId = req.correlationId;

  // 1. Handled AppError instances
  if (err instanceof AppError) {
    logger.warn(`AppError [${err.statusCode}]: ${err.message}`, {
      correlationId,
      path: req.originalUrl,
      method: req.method,
      details: err.details,
    });
    return sendError(
      res,
      err.message,
      err.statusCode,
      err.constructor.name.toUpperCase(),
      err.details
    );
  }

  // 2. Prisma Database Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    logger.error(`Prisma error [${err.code}]: ${err.message}`, { correlationId });

    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[])?.join(', ') || 'field';
      return sendError(
        res,
        `A record with this ${target} already exists.`,
        409,
        'UNIQUE_CONSTRAINT_VIOLATION',
        { fields: err.meta?.target }
      );
    }

    if (err.code === 'P2025') {
      return sendError(
        res,
        'The requested record was not found.',
        404,
        'RECORD_NOT_FOUND'
      );
    }

    if (err.code === 'P2003') {
      return sendError(
        res,
        'Foreign key constraint failed.',
        400,
        'FOREIGN_KEY_VIOLATION'
      );
    }
  }

  // 3. Multer File Upload Errors
  if (err.name === 'MulterError') {
    logger.warn(`Multer error: ${err.message}`, { correlationId });
    return sendError(res, err.message, 400, 'FILE_UPLOAD_ERROR');
  }

  // 4. JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid token signature.', 401, 'INVALID_TOKEN');
  }
  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Token expired.', 401, 'TOKEN_EXPIRED');
  }

  // 5. Unhandled Server Errors
  logger.error('Unhandled internal server error:', {
    correlationId,
    error: err?.message || err,
    stack: err?.stack,
    path: req.originalUrl,
    method: req.method,
  });

  return sendError(
    res,
    process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred. Please try again later.'
      : err.message || 'Internal Server Error',
    500,
    'INTERNAL_SERVER_ERROR'
  );
}
