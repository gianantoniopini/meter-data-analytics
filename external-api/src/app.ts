import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { router } from './routes/router';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const basePath = process.env.BASE_PATH as string;

export const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(basePath, router);
app.use(errorHandler);
