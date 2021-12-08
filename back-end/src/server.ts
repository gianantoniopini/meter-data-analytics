import dotenv from 'dotenv';
import { initialize as initializeApp } from './app';
import { openConnection } from './database';

dotenv.config();

if (!process.env.PORT) {
  console.error(`no PORT found in process.env`);
  process.exit(1);
}

const app = initializeApp();

const port: number = parseInt(process.env.PORT as string, 10);

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
  .catch((reason) => {
    console.error('could not open connection to MongoDB');
    console.error(reason);
  });
