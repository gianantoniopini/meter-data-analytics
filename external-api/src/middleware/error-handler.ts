import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import HttpException from './http-exception';

export const errorHandler = (
  error: HttpException,
  request: Request,
  response: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): undefined => {
  const status = error.status || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = error.message || 'Something went wrong';

  response.status(status).json({
    status: response.statusCode,
    message: message
  });

  return undefined;
};
