import HttpException from './HttpException';
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: HttpException,
  request: Request,
  response: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): undefined => {
  const status = error.status || 500;
  const message = error.message || 'Something went wrong';

  response.status(status).json({
    status: response.statusCode,
    message: message
  });

  return undefined;
};
