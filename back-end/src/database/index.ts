import fs from 'node:fs/promises';
import { connect, Connection, disconnect } from 'mongoose';
import SmartMeter from '@shared/interfaces/smart-meter.interface';
import SmartMeterModel from '../models/smart-meter.model';

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

  const smartMeters: SmartMeter[] = [];
  const filePath = './data/smart_meters.json';
  const fileData = await fs.readFile(filePath, { encoding: 'utf8' });
  smartMeters.push(...JSON.parse(fileData));

  await SmartMeterModel.collection.insertMany(smartMeters);

  return true;
};
