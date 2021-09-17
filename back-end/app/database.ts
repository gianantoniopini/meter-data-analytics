import { connect } from 'mongoose';

async function openConnection(): Promise<void> {
  const { connection } = await connect(process.env.MONGO_URI as string);
  console.log('MongoDB connected Successfully!');
  console.log(`MongoDB connection host: ${connection.host}`);
}

export default openConnection;
