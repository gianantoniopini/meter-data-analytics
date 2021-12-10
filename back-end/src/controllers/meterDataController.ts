import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { handleUnknownError } from '../utils/controllerUtils';
import { authenticateAndGetMeasurement } from '../utils/externalApiProxy';
import { ExternalApiMeasurement } from '../interfaces/ExternalApiMeasurement';
import MeasurementModel from '../models/MeasurementModel';

const mapExternalApiMeasurement = (
  externalApiMeasurement: ExternalApiMeasurement
) => {
  return new MeasurementModel({
    measurement: externalApiMeasurement.measurement,
    timestamp: externalApiMeasurement.timestamp,
    tags: {
      muid: externalApiMeasurement.tags.muid
    },
    '0100010700FF': externalApiMeasurement['0100010700FF'],
    '0100020700FF': externalApiMeasurement['0100020700FF'],
    '0100100700FF': externalApiMeasurement['0100100700FF']
  });
};

const _getMeasurementsFromExternalApi = async (
  muid: string,
  start: string | undefined,
  stop: string | undefined,
  limit: string | undefined
): Promise<ExternalApiMeasurement[]> => {
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
    const muid = req.body.muid as string | undefined;

    if (!muid) {
      res.status(StatusCodes.BAD_REQUEST).json({
        status: res.statusCode,
        message: 'muid body parameter not present'
      });
      return;
    }

    const measurementsFromExternalApi = await _getMeasurementsFromExternalApi(
      muid,
      req.body.start as string | undefined,
      req.body.stop as string | undefined,
      req.body.limit as string | undefined
    );

    const deleteResult = await MeasurementModel.deleteMany({ tags: { muid } });

    const measurements = measurementsFromExternalApi.map((em) =>
      mapExternalApiMeasurement(em)
    );

    let insertedCount = 0;
    if (measurements.length > 0) {
      const insertResult = await MeasurementModel.collection.insertMany(
        measurements
      );
      insertedCount = insertResult.insertedCount;
    }

    const message = `${deleteResult.deletedCount} measurements deleted - ${insertedCount} measurements inserted`;
    res.status(StatusCodes.OK).json({
      status: res.statusCode,
      message
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
