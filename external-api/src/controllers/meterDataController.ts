import { Request, Response } from 'express';
import Measurement from '../interfaces/Measurement';

export const getMeasurements = async (
  req: Request,
  res: Response
): Promise<void> => {
  const measurements: Measurement[] = [
    {
      measurement: 'power',
      timestamp: new Date('2020-07-01T23:45:00Z'),
      tags: { muid: '09a2bc02-2f88-4d01-ae59-a7f60c4a0dd1' },
      '0100010700FF': 54.00407878772595,
      '0100020700FF': 0,
      '0100100700FF': 54.00407878772595
    }
  ];

  res.status(200).json({
    status: res.statusCode,
    data: measurements
  });
};
