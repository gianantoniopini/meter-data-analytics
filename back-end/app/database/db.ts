import { connect } from 'mongoose';

async function connectDb(): Promise<void> {
  const conn = await connect(process.env.MONGO_URI as string);
  console.log('MongoDB connected Successfully!');
  console.log(`MongoDB connection host: ${conn.connection.host}`);
}

export default connectDb;
