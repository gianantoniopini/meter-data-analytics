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

export default MeasurementModel;
