import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt, { VerifyErrors } from 'jsonwebtoken';
import { handleUnknownError } from '../utils/controller-utils';
import User from '../interfaces/user.interface';

export const accessTokenCookieName = 'access_token';

export const generateAccessToken = (
  user: User,
  validityPeriodInSeconds: number
) => {
  return jwt.sign(user, process.env.AUTH_ACCESS_TOKEN_SECRET as jwt.Secret, {
    expiresIn: validityPeriodInSeconds
  });
};

export const validateAccessToken = (
  request: Request,
  response: Response,
  next: express.NextFunction
): void => {
  try {
    const accessToken = request.cookies[accessTokenCookieName] as string;

    if (!accessToken) {
      response.status(StatusCodes.BAD_REQUEST).json({
        status: response.statusCode,
        message: 'Token not present'
      });
      return;
    }

    jwt.verify(
      accessToken,
      process.env.AUTH_ACCESS_TOKEN_SECRET as jwt.Secret,
      (error: VerifyErrors | null) => {
        if (error) {
          response.status(StatusCodes.FORBIDDEN).json({
            status: response.statusCode,
            message: 'Token invalid'
          });
        } else {
          next();
        }
      }
    );
  } catch (error: unknown) {
    handleUnknownError(error, next);
    return;
  }
};
