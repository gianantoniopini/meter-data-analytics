import { connect, Connection, disconnect } from 'mongoose';

export const openConnection = async (
  connectionString: string
): Promise<Connection> => {
  const { connection } = await connect(connectionString);
  return connection;
};

export const closeConnection = async (): Promise<void> => {
  await disconnect();
};
