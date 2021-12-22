import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import fs from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import { handleUnknownError } from '../utils/controller-utils';
import Measurement from '../interfaces/measurement.interface';

export const getMeasurements = async (
  request: Request,
  response: Response,
  next: express.NextFunction
): Promise<void> => {
  try {
    const muid = request.query.muid as string | undefined;
    const start = request.query.start as string | undefined;
    const stop = request.query.stop as string | undefined;
    const limit = request.query.limit as string | undefined;

    if (!muid) {
      response.status(StatusCodes.BAD_REQUEST).json({
        status: response.statusCode,
        message: 'muid query parameter not present'
      });
      return;
    }

    const measurements: Measurement[] = [];

    // eslint-disable-next-line unicorn/prefer-module
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

    const limitAsNumber = limit ? Number.parseInt(limit, 10) : 1;
    const slicedMeasurements = filteredMeasurements.slice(0, limitAsNumber);

    response.status(StatusCodes.OK).json({
      status: response.statusCode,
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
