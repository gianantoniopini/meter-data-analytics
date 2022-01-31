import { model, Schema, Model } from 'mongoose';
import { Measurement } from '../interfaces/measurement.interface';

const MeasurementSchema: Schema = new Schema(
  {
    measurement: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      required: true
    },
    tags: {
      muid: {
        type: String,
        required: true
      }
    },
    '0100010700FF': {
      type: Number,
      required: true
    },
    '0100020700FF': {
      type: Number,
      required: true
    },
    '0100100700FF': {
      type: Number,
      required: true
    }
  },
  { collection: 'measurements' }
);

const MeasurementModel: Model<Measurement> = model(
  'Measurement',
  MeasurementSchema
);

export const powerMeasurement = 'power';

export const query = async (
  muid: string,
  start: string | undefined,
  stop: string | undefined,
  measurement: string | undefined,
  limit: string | undefined
): Promise<Measurement[]> => {
  const conditions = [];

  conditions.push({ tags: { muid: muid } });

  if (start) {
    conditions.push({ timestamp: { $gte: new Date(start) } });
  }

  if (stop) {
    conditions.push({ timestamp: { $lte: new Date(stop) } });
  }

  if (measurement) {
    conditions.push({ measurement: measurement });
  }

  const limitAsNumber = limit ? Number.parseInt(limit, 10) : 1;

  return await MeasurementModel.find({
    $and: conditions
  }).limit(limitAsNumber);
};

export default MeasurementModel;
