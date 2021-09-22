import express, { Request, Response } from 'express';
import HttpException from '../middleware/HttpException';
import {
  authenticateAndGetMeasurement,
  Measurement as ExternalMeasurement
} from './externalApi';
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

export const getMeasurementsFromExternalApi = async (
  req: Request,
  res: Response,
  next: express.NextFunction
): Promise<void> => {
  const { Measurements: measurements, error } =
    await authenticateAndGetMeasurement(
      req.query['muid'] as string,
      req.query['start'] as string,
      req.query['stop'] as string,
      parseInt(req.query['limit'] as string)
    );
  if (error) {
    next(new HttpException(500, error));
    return;
  }

  res.status(200).json({
    status: res.statusCode,
    data: measurements
  });
};

export const importMeasurements = async (
  req: Request,
  res: Response,
  next: express.NextFunction
): Promise<void> => {
  const { Measurements: measurementsFromExternalApi, error } =
    await authenticateAndGetMeasurement(
      req.body['muid'] as string,
      req.body['start'] as string,
      req.body['stop'] as string,
      parseInt(req.body['limit'] as string)
    );
  if (error) {
    next(new HttpException(500, error));
    return;
  }

  if (!measurementsFromExternalApi) {
    const error = 'Could not retrieve measurements from external api.';
    next(new HttpException(500, error));
    return;
  }

  const measurements = measurementsFromExternalApi.map((em) =>
    mapExternalMeasurement(em)
  );
  await MeasurementModel.deleteMany();
  const result = await MeasurementModel.collection.insertMany(measurements);

  res.status(200).json({
    status: res.statusCode,
    message: `${result.insertedCount} measurements imported successfully!`
  });
};

export const getMeasurements = async (
  req: Request,
  res: Response
): Promise<void> => {
  const muid = req.query.muid as string | undefined;
  const start = req.query.start as string | undefined;
  const stop = req.query.stop as string | undefined;
  const limit = req.query.limit as string | undefined;

  const conditions = [];
  if (muid) {
    conditions.push({ tags: { muid: muid } });
  }
  if (start) {
    conditions.push({ timestamp: { $gte: new Date(start) } });
  }
  if (stop) {
    conditions.push({ timestamp: { $lte: new Date(stop) } });
  }

  const andConditons = conditions.length ? { $and: conditions } : {};

  const limitAsNumber = limit ? parseInt(limit) : 1;

  const measurements = await MeasurementModel.find(andConditons).limit(
    limitAsNumber
  );

  res.status(200).json({
    status: res.statusCode,
    data: measurements
  });
};
