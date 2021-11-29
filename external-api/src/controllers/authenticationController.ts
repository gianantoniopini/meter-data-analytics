import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { handleUnknownError } from '../utils/controllerUtils';
import User from '../interfaces/User';
import { accessTokenCookieName, generateAccessToken } from '../middleware/auth';

export const authenticate = (
  req: Request,
  res: Response,
  next: express.NextFunction
): void => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
      res.status(StatusCodes.BAD_REQUEST).json({
        status: res.statusCode,
        message: 'Email address or password not present'
      });
      return;
    }

    if (email !== process.env.AUTH_EMAIL || password !== process.env.AUTH_PWD) {
      res.status(StatusCodes.BAD_REQUEST).json({
        status: res.statusCode,
        message: 'Invalid email address or password'
      });
      return;
    }

    const user: User = { email: email, password: password };
    const validityPeriodInSeconds = 3600;
    const accessToken = generateAccessToken(user, validityPeriodInSeconds);

    const validityPeriodInMilliseconds = validityPeriodInSeconds * 1000;
    res.cookie(accessTokenCookieName, accessToken, {
      maxAge: validityPeriodInMilliseconds,
      httpOnly: true
    });
    res.status(StatusCodes.OK).json({
      status: res.statusCode,
      data: validityPeriodInMilliseconds
    });
  } catch (error: unknown) {
    handleUnknownError(error, next);
    return;
  }
};
