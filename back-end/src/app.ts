import express, { Application } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { router } from './routes/router';
import { errorHandler } from './middleware/error-handler';

export const initialize = (): Application => {
  const app: Application = express();

  const basePath = process.env.BASE_PATH as string;

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true,
    legacyHeaders: false
  });

  // Middleware
  app.use(limiter);
  app.use(cors());
  app.use(express.json());
  app.use(basePath, router);
  app.use(errorHandler);

  return app;
};
