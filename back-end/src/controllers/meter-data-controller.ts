import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { handleUnknownError } from '../utils/controller-utils';
import { authenticateAndGetMeasurement } from '../utils/external-api-proxy';
import { ExternalApiMeasurement } from '../interfaces/external-api-measurement.interface';
import MeasurementModel from '../models/measurement.model';

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
    limit ? Number.parseInt(limit, 10) : undefined
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
  request: Request,
  response: Response,
  next: express.NextFunction
): Promise<void> => {
  try {
    if (!request.query.muid) {
      response.status(StatusCodes.BAD_REQUEST).json({
        status: response.statusCode,
        message: 'muid query parameter not present'
      });
      return;
    }

    const measurements = await _getMeasurementsFromExternalApi(
      request.query.muid as string,
      request.query.start as string | undefined,
      request.query.stop as string | undefined,
      request.query.limit as string | undefined
    );

    response.status(StatusCodes.OK).json({
      status: response.statusCode,
      data: measurements
    });
  } catch (error: unknown) {
    handleUnknownError(error, next);
    return;
  }
};

export const importMeasurements = async (
  request: Request,
  response: Response,
  next: express.NextFunction
): Promise<void> => {
  try {
    const muid = request.body.muid as string | undefined;

    if (!muid) {
      response.status(StatusCodes.BAD_REQUEST).json({
        status: response.statusCode,
        message: 'muid body parameter not present'
      });
      return;
    }

    const measurementsFromExternalApi = await _getMeasurementsFromExternalApi(
      muid,
      request.body.start as string | undefined,
      request.body.stop as string | undefined,
      request.body.limit as string | undefined
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
    response.status(StatusCodes.OK).json({
      status: response.statusCode,
      message
    });
  } catch (error: unknown) {
    handleUnknownError(error, next);
    return;
  }
};

export const getMeasurements = async (
  request: Request,
  response: Response,
  next: express.NextFunction
): Promise<void> => {
  try {
    if (!request.query.muid) {
      response.status(StatusCodes.BAD_REQUEST).json({
        status: response.statusCode,
        message: 'muid query parameter not present'
      });
      return;
    }

    const muid = request.query.muid as string;
    const start = request.query.start as string | undefined;
    const stop = request.query.stop as string | undefined;
    const limit = request.query.limit as string | undefined;

    const conditions = [];
    conditions.push({ tags: { muid: muid } });
    if (start) {
      conditions.push({ timestamp: { $gte: new Date(start) } });
    }
    if (stop) {
      conditions.push({ timestamp: { $lte: new Date(stop) } });
    }

    const limitAsNumber = limit ? Number.parseInt(limit, 10) : 1;

    const measurements = await MeasurementModel.find({
      $and: conditions
    }).limit(limitAsNumber);

    response.status(StatusCodes.OK).json({
      status: response.statusCode,
      data: measurements
    });
  } catch (error: unknown) {
    handleUnknownError(error, next);
    return;
  }
};
