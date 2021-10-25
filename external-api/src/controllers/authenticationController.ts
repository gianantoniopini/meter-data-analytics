import jwt, { VerifyErrors } from 'jsonwebtoken';
import express, { Request, Response } from 'express';
import HttpException from '../middleware/HttpException';

type User = {
  email: string;
  password: string;
};

const accessTokenCookieName = '_db_sess';

export const authenticate = (
  req: Request,
  res: Response,
  next: express.NextFunction
): void => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    if (email !== process.env.AUTH_EMAIL || password !== process.env.AUTH_PWD) {
      res.status(400).json({
        status: res.statusCode,
        message: 'Invalid email address or password!'
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
    res.status(200).json({
      status: res.statusCode,
      data: validityPeriodInMilliseconds
    });
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : 'An unexpected error occurred';
    next(new HttpException(500, message));
    return;
  }
};

export const validateAccessToken = (
  req: Request,
  res: Response,
  next: express.NextFunction
): void => {
  try {
    const accessToken = req.cookies[accessTokenCookieName] as string;

    if (!accessToken) {
      res.status(400).json({
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
          res.status(403).json({
            status: res.statusCode,
            message: 'Token invalid'
          });
        } else {
          next();
        }
      }
    );
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : 'An unexpected error occurred';
    next(new HttpException(500, message));
    return;
  }
};

const generateAccessToken = (user: User, validityPeriodInSeconds: number) => {
  const accessToken = jwt.sign(
    user,
    process.env.AUTH_ACCESS_TOKEN_SECRET as jwt.Secret,
    {
      expiresIn: validityPeriodInSeconds
    }
  );

  return accessToken;
};
