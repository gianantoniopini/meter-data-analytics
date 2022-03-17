import { model, Model, Schema } from 'mongoose';
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

const SmartMeterModel: Model<SmartMeter> = model(
  'SmartMeter',
  SmartMeterSchema
);

export default SmartMeterModel;
