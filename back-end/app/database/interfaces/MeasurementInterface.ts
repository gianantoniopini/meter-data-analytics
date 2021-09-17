import mongoose, { Document } from 'mongoose';

export interface MeasurementInterface extends Document {
  _id: mongoose.Types.ObjectId;
  measurement: string;
  timestamp: Date;
  tags: { muid: string };
  '0100010700FF': number;
  '0100020700FF': number;
  '0100100700FF': number;
}
