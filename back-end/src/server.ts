import dotenv from 'dotenv';
import { initialize as initializeApp } from './app';
import { openConnection } from './database';

dotenv.config();

if (!process.env.PORT) {
  throw new Error(`no PORT found in process.env`);
}

const app = initializeApp();

const port: number = Number.parseInt(process.env.PORT as string, 10);

openConnection(process.env.MONGO_URI as string)
  .then((connection) => {
    console.log(
      `MongoDB connection opened successfully -> connection host: ${connection.host}`
    );

    // Server Listening
    app.listen(port, () => {
      console.log(`server started at port ${port}`);
      console.log(`app running here -> http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('could not open connection to MongoDB');
    console.error(error);
  });
