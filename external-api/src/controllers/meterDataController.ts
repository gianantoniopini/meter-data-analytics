import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import fs from 'fs/promises';
import { constants as fsConstants } from 'fs';
import { handleUnknownError } from '../utils/controllerUtils';
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
      res.status(StatusCodes.BAD_REQUEST).json({
        status: res.statusCode,
        message: 'muid query parameter not present'
      });
      return;
    }

    const measurements: Measurement[] = [];

    const filePath = `${__dirname}/../../data/measurements/${muid}.json`;
    const fileExists = await exists(filePath);
    if (fileExists) {
      const fileData = await fs.readFile(filePath, { encoding: 'utf8' });
      measurements.push(...JSON.parse(fileData));
    }

    const filteredMeasurements = measurements.filter((m) => {
      return (
        (!start || new Date(m.timestamp) >= new Date(start)) &&
        (!stop || new Date(m.timestamp) <= new Date(stop))
      );
    });

    const limitAsNumber = limit ? parseInt(limit, 10) : 1;
    const slicedMeasurements = filteredMeasurements.slice(0, limitAsNumber);

    res.status(StatusCodes.OK).json({
      status: res.statusCode,
      data: slicedMeasurements
    });
  } catch (error: unknown) {
    handleUnknownError(error, next);
    return;
  }
};

const exists = async (path: string): Promise<boolean> => {
  try {
    await fs.access(path, fsConstants.R_OK);
    return true;
  } catch {
    return false;
  }
};
