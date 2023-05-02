import dotenv from 'dotenv';
import { initialize as initializeApp } from './app';
import { openConnection, seed } from './database';

dotenv.config();

if (!process.env.PORT) {
  throw new Error(`no PORT found in process.env`);
}

const app = initializeApp();

const port: number = Number.parseInt(process.env.PORT as string, 10);

openConnection(process.env.MONGO_URI as string)
  .then((connection) => {
    console.info(
      `MongoDB connection opened successfully -> connection host: ${connection.host}`
    );

    seed()
      .then((result) => {
        if (result) {
          console.info(`MongoDB seeded`);
        }

        app.listen(port, () => {
          console.info(`server started at port ${port}`);
          console.info(`app running here -> http://localhost:${port}`);
        });
      })
      .catch((error) => {
        console.error('could not seed MongoDB');
        console.error(error);
      });
  })
  // eslint-disable-next-line unicorn/prefer-top-level-await
  .catch((error) => {
    console.error('could not open connection to MongoDB');
    console.error(error);
  });
