import { model, Schema } from 'mongoose';
import SmartMeter from '@shared/interfaces/smart-meter.interface';

const SmartMeterSchema: Schema = new Schema<SmartMeter>(
  {
    muid: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    }
  },
  { collection: 'smart_meters' }
);

const SmartMeterModel = model<SmartMeter>('SmartMeter', SmartMeterSchema);

export default SmartMeterModel;
