import jwt from 'jsonwebtoken';
import express, { Request, Response } from 'express';
import HttpException from '../middleware/HttpException';

type User = {
  email: string;
  password: string;
};

export const authenticate = async (
  req: Request,
  res: Response,
  next: express.NextFunction
): Promise<void> => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    if (email !== process.env.AUTH_EMAIL || password !== process.env.AUTH_PWD) {
      res.status(400).send({
        status: res.statusCode,
        message: 'Invalid email address or password!'
      });
      return;
    }

    const user: User = { email: email, password: password };
    const validityPeriodInSeconds = 3600;
    const accessToken = generateAccessToken(user, validityPeriodInSeconds);

    const validityPeriodInMilliseconds = validityPeriodInSeconds * 1000;
    res.cookie('_db_sess', accessToken, {
      maxAge: validityPeriodInMilliseconds
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
