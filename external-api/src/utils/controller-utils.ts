import express from 'express';
import { StatusCodes } from 'http-status-codes';
import HttpException from '../middleware/http-exception';

export const handleUnknownError = (
  error: unknown,
  next: express.NextFunction
): void => {
  const message =
    error instanceof Error ? error.message : 'An unexpected error occurred';
  next(new HttpException(StatusCodes.INTERNAL_SERVER_ERROR, message));
};
