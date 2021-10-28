import { connect } from 'mongoose';

async function openConnection(): Promise<void> {
  try {
    const { connection } = await connect(process.env.MONGO_URI as string);
    console.log('MongoDB connected Successfully!');
    console.log(`MongoDB connection host: ${connection.host}`);
  } catch (error) {
    console.log('Could not open connection to MongoDB');
    console.log(error);
    throw error;
  }
}

export default openConnection;
