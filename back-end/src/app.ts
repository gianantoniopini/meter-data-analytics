import express, { Application } from 'express';
import cors from 'cors';
import { router } from './routes/router';
import { errorHandler } from './middleware/error-handler';

export const initialize = (): Application => {
  const basePath = process.env.BASE_PATH as string;

  const app: Application = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(basePath, router);
  app.use(errorHandler);

  return app;
};
