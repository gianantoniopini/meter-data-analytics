import { connect, Connection, disconnect } from 'mongoose';
import SmartMeterModel from '../models/smart-meter.model';
import SmartMeterSeedData from './seed-data/smart-meter.seed-data';

export const openConnection = async (
  connectionString: string
): Promise<Connection> => {
  const { connection } = await connect(connectionString);
  return connection;
};

export const closeConnection = async (): Promise<void> => {
  await disconnect();
};

export const seed = async (): Promise<boolean> => {
  const smartMetersCount = await SmartMeterModel.countDocuments();
  if (smartMetersCount > 0) {
    return false;
  }

  await SmartMeterModel.insertMany(SmartMeterSeedData);

  return true;
};
