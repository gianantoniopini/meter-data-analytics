import express, { Request, Response } from 'express';
import fs from 'fs/promises';
import { handleUnknownError } from './utils';
import Measurement from '../interfaces/Measurement';

export const getMeasurements = async (
  req: Request,
  res: Response,
  next: express.NextFunction
): Promise<void> => {
  try {
    const muid = req.query.muid as string | undefined;
    const start = req.query.start as string | undefined;
    const stop = req.query.stop as string | undefined;
    const limit = req.query.limit as string | undefined;

    if (!muid) {
      res.status(400).json({
        status: res.statusCode,
        message: 'muid query parameter not present'
      });
      return;
    }

    const filePath = `${__dirname}/../../data/measurements/${muid}.json`;
    const fileData = await fs.readFile(filePath, { encoding: 'utf8' });

    const measurements: Measurement[] = JSON.parse(fileData);

    const filteredMeasurements = measurements.filter((m) => {
      return (
        (!start || new Date(m.timestamp) >= new Date(start)) &&
        (!stop || new Date(m.timestamp) <= new Date(stop))
      );
    });

    const limitAsNumber = limit ? parseInt(limit) : 1;
    const slicedMeasurements = filteredMeasurements.slice(0, limitAsNumber);

    res.status(200).json({
      status: res.statusCode,
      data: slicedMeasurements
    });
  } catch (error: unknown) {
    handleUnknownError(error, next);
    return;
  }
};
