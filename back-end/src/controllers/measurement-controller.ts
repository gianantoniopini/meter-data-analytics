import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { handleUnknownError } from '../utils/controller-utils';
import { authenticateAndGetMeasurement } from '../utils/external-api-proxy';
import ExternalApiMeasurement from '@shared/interfaces/external-api-measurement.interface';
import MeasurementModel, {
  powerMeasurement,
  query
} from '../models/measurement.model';
import MeasurementAnalyticsService from '../services/measurement-analytics.service';

const muidParameterNotPresentInRequest =
  'muid parameter not present in request';

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
        message: muidParameterNotPresentInRequest
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
        message: muidParameterNotPresentInRequest
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
      const insertResult = await MeasurementModel.insertMany(measurements);
      insertedCount = insertResult.length;
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
        message: muidParameterNotPresentInRequest
      });
      return;
    }

    const measurements = await query(
      request.query.muid as string,
      request.query.start as string | undefined,
      request.query.stop as string | undefined,
      undefined,
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

export const getInstantaneousPowerMeasurements = async (
  request: Request,
  response: Response,
  next: express.NextFunction
): Promise<void> => {
  try {
    if (!request.query.muid) {
      response.status(StatusCodes.BAD_REQUEST).json({
        status: response.statusCode,
        message: muidParameterNotPresentInRequest
      });
      return;
    }

    const measurements = await query(
      request.query.muid as string,
      request.query.start as string | undefined,
      request.query.stop as string | undefined,
      powerMeasurement,
      request.query.limit as string | undefined
    );

    const averagePowerByWeekday =
      MeasurementAnalyticsService.calculateAveragePowerByWeekday(measurements);
    const averagePowerByHour =
      MeasurementAnalyticsService.calculateAveragePowerByHour(measurements);

    response.status(StatusCodes.OK).json({
      status: response.statusCode,
      data: {
        timeSeries: measurements,
        analytics: { averagePowerByWeekday, averagePowerByHour }
      }
    });
  } catch (error: unknown) {
    handleUnknownError(error, next);
    return;
  }
};
