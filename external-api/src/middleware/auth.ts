import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt, { VerifyErrors } from 'jsonwebtoken';
import { handleUnknownError } from '../utils/controllerUtils';
import User from '../interfaces/User';

export const accessTokenCookieName = 'auth_token';

export const generateAccessToken = (
  user: User,
  validityPeriodInSeconds: number
) => {
  const accessToken = jwt.sign(
    user,
    process.env.AUTH_ACCESS_TOKEN_SECRET as jwt.Secret,
    {
      expiresIn: validityPeriodInSeconds
    }
  );

  return accessToken;
};

export const validateAccessToken = (
  req: Request,
  res: Response,
  next: express.NextFunction
): void => {
  try {
    const accessToken = req.cookies[accessTokenCookieName] as string;

    if (!accessToken) {
      res.status(StatusCodes.BAD_REQUEST).json({
        status: res.statusCode,
        message: 'Token not present'
      });
      return;
    }

    jwt.verify(
      accessToken,
      process.env.AUTH_ACCESS_TOKEN_SECRET as jwt.Secret,
      (err: VerifyErrors | null) => {
        if (err) {
          res.status(StatusCodes.FORBIDDEN).json({
            status: res.statusCode,
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
