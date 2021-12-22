import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { handleUnknownError } from '../utils/controller-utils';
import User from '../interfaces/user.interface';
import { accessTokenCookieName, generateAccessToken } from '../middleware/auth';

export const authenticate = (
  request: Request,
  response: Response,
  next: express.NextFunction
): void => {
  try {
    const email = request.body.email;
    const password = request.body.password;

    if (!email || !password) {
      response.status(StatusCodes.BAD_REQUEST).json({
        status: response.statusCode,
        message: 'Email address or password not present'
      });
      return;
    }

    if (email !== process.env.AUTH_EMAIL || password !== process.env.AUTH_PWD) {
      response.status(StatusCodes.BAD_REQUEST).json({
        status: response.statusCode,
        message: 'Invalid email address or password'
      });
      return;
    }

    const user: User = { email: email, password: password };
    const validityPeriodInSeconds = Number.parseInt(
      process.env.AUTH_ACCESS_TOKEN_LIFESPAN_SECONDS as string,
      10
    );
    const accessToken = generateAccessToken(user, validityPeriodInSeconds);

    const validityPeriodInMilliseconds = validityPeriodInSeconds * 1000;
    response.cookie(accessTokenCookieName, accessToken, {
      maxAge: validityPeriodInMilliseconds,
      httpOnly: true
    });
    response.status(StatusCodes.OK).json({
      status: response.statusCode,
      data: validityPeriodInMilliseconds
    });
  } catch (error: unknown) {
    handleUnknownError(error, next);
    return;
  }
};
