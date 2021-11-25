import dotenv from 'dotenv';
import { app } from './app';

dotenv.config();

if (!process.env.PORT) {
  console.log(`no PORT found in process.env`);
  process.exit(1);
}

const port: number = parseInt(process.env.PORT as string, 10);

// Server Listening
app.listen(port, () => {
  console.log(`server started at port ${port}`);
  console.log(`app running here -> http://localhost:${port}`);
});
