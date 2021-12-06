import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { handleUnknownError } from '../utils/controllerUtils';
import {
  authenticateAndGetMeasurement,
  Measurement as ExternalMeasurement
} from '../utils/externalApiProxy';
import MeasurementModel from '../models/MeasurementModel';

const mapExternalMeasurement = (externalMeasurement: ExternalMeasurement) => {
  return new MeasurementModel({
    measurement: externalMeasurement.measurement,
    timestamp: externalMeasurement.timestamp,
    tags: {
      muid: externalMeasurement.tags.muid
    },
    '0100010700FF': externalMeasurement['0100010700FF'],
    '0100020700FF': externalMeasurement['0100020700FF'],
    '0100100700FF': externalMeasurement['0100100700FF']
  });
};

const _getMeasurementsFromExternalApi = async (
  muid: string,
  start: string | undefined,
  stop: string | undefined,
  limit: string | undefined
): Promise<[ExternalMeasurement]> => {
  const { measurements, error } = await authenticateAndGetMeasurement(
    muid,
    start,
    stop,
    limit ? parseInt(limit, 10) : undefined
  );

  if (error) {
    throw new Error(error);
  }

  if (!measurements) {
    throw new Error('Could not retrieve measurements from external api.');
  }

  return measurements;
};

export const getMeasurementsFromExternalApi = async (
  req: Request,
  res: Response,
  next: express.NextFunction
): Promise<void> => {
  try {
    if (!req.query.muid) {
      res.status(StatusCodes.BAD_REQUEST).json({
        status: res.statusCode,
        message: 'muid query parameter not present'
      });
      return;
    }

    const measurements = await _getMeasurementsFromExternalApi(
      req.query.muid as string,
      req.query.start as string | undefined,
      req.query.stop as string | undefined,
      req.query.limit as string | undefined
    );

    res.status(StatusCodes.OK).json({
      status: res.statusCode,
      data: measurements
    });
  } catch (error: unknown) {
    handleUnknownError(error, next);
    return;
  }
};

export const importMeasurements = async (
  req: Request,
  res: Response,
  next: express.NextFunction
): Promise<void> => {
  try {
    if (!req.body.muid) {
      res.status(StatusCodes.BAD_REQUEST).json({
        status: res.statusCode,
        message: 'muid body parameter not present'
      });
      return;
    }

    const measurementsFromExternalApi = await _getMeasurementsFromExternalApi(
      req.body.muid as string,
      req.body.start as string | undefined,
      req.body.stop as string | undefined,
      req.body.limit as string | undefined
    );

    const measurements = measurementsFromExternalApi.map((em) =>
      mapExternalMeasurement(em)
    );
    await MeasurementModel.deleteMany();
    const result = await MeasurementModel.collection.insertMany(measurements);

    res.status(StatusCodes.OK).json({
      status: res.statusCode,
      message: `${result.insertedCount} measurements imported successfully!`
    });
  } catch (error: unknown) {
    handleUnknownError(error, next);
    return;
  }
};

export const getMeasurements = async (
  req: Request,
  res: Response,
  next: express.NextFunction
): Promise<void> => {
  try {
    if (!req.query.muid) {
      res.status(StatusCodes.BAD_REQUEST).json({
        status: res.statusCode,
        message: 'muid query parameter not present'
      });
      return;
    }

    const muid = req.query.muid as string;
    const start = req.query.start as string | undefined;
    const stop = req.query.stop as string | undefined;
    const limit = req.query.limit as string | undefined;

    const conditions = [];
    conditions.push({ tags: { muid: muid } });
    if (start) {
      conditions.push({ timestamp: { $gte: new Date(start) } });
    }
    if (stop) {
      conditions.push({ timestamp: { $lte: new Date(stop) } });
    }

    const andConditons = conditions.length ? { $and: conditions } : {};

    const limitAsNumber = limit ? parseInt(limit, 10) : 1;

    const measurements = await MeasurementModel.find(andConditons).limit(
      limitAsNumber
    );

    res.status(StatusCodes.OK).json({
      status: res.statusCode,
      data: measurements
    });
  } catch (error: unknown) {
    handleUnknownError(error, next);
    return;
  }
};
