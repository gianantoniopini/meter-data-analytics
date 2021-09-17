import { model, Schema, Model } from 'mongoose';
import { MeasurementInterface } from '../interfaces/MeasurementInterface';

const MeasurementSchema: Schema = new Schema({
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
});

const MeasurementModel: Model<MeasurementInterface> = model(
  'Measurement',
  MeasurementSchema
);

export default MeasurementModel;
