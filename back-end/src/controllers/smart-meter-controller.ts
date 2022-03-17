import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { handleUnknownError } from '../utils/controller-utils';
import SmartMeterModel from '../models/smart-meter.model';

export const getSmartMeters = async (
  request: Request,
  response: Response,
  next: express.NextFunction
): Promise<void> => {
  try {
    const smartMeters = await SmartMeterModel.find();

    response.status(StatusCodes.OK).json({
      status: response.statusCode,
      data: smartMeters
    });
  } catch (error: unknown) {
    handleUnknownError(error, next);
    return;
  }
};
