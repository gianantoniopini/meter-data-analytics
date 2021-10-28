import express from 'express';
import HttpException from '../middleware/HttpException';

export const handleUnknownError = (
  error: unknown,
  next: express.NextFunction
): void => {
  const message =
    error instanceof Error ? error.message : 'An unexpected error occurred';
  next(new HttpException(500, message));
};
