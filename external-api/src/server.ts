import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { router } from './routes/router';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

if (!process.env.PORT) {
  console.log(`no PORT found in process.env`);
  process.exit(1);
}

const port: number = parseInt(process.env.PORT as string, 10);
const basePath = process.env.BASE_PATH as string;

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(basePath, router);
app.use(errorHandler);

// Server Listening
app.listen(port, () => {
  console.log(`server started at port ${port}`);
  console.log(`app running here -> http://localhost:${port}`);
});
