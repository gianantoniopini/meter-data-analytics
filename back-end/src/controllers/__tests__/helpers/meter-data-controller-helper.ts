import Measurement from '@shared/interfaces/measurement.interface';
import MeasurementModel from '../../../models/measurement.model';

export const setupMeasurements = async (
  muid: string,
  timestampStart: Date,
  measurement: string,
  count: number
): Promise<Measurement[]> => {
  const measurements: Measurement[] = [];

  const indexes = [...Array.from({ length: count }).keys()].map(
    (index) => index
  );
  for (const index of indexes) {
    // One measurement every 15 minutes
    const timestamp = new Date(timestampStart.getTime() + 15 * index * 60_000);

    // Random value between 0 and 5000
    const value = Math.random() * 5000;

    const measurementModel = new MeasurementModel({
      measurement: measurement,
      timestamp: timestamp,
      tags: { muid: muid },
      '0100010700FF': value,
      '0100020700FF': 0,
      '0100100700FF': value
    });

    await measurementModel.save();

    measurements.push(measurementModel);
  }

  return measurements;
};
