import { MongoMemoryServer } from 'mongodb-memory-server';
import { openConnection, closeConnection, seed } from '../../database';
import SmartMeterModel from '../../models/smart-meter.model';
import SmartMeterSeedData from '../seed-data/smart-meter.seed-data';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  try {
    mongoServer = await MongoMemoryServer.create();
    await openConnection(mongoServer.getUri());
  } catch (error) {
    console.error(error);
    throw error;
  }
});

describe('database seeding', () => {
  it('should not insert any smart meter document if the collection is not empty', async () => {
    const smartMeterModel = new SmartMeterModel({
      muid: '09a2bc02-2f88-4d01-ae59-a7f60c4a0dd1',
      name: 'Smart Meter 1'
    });
    await smartMeterModel.save();

    const result = await seed();

    expect(result).toEqual(false);
    const actualDocumentsCount = await SmartMeterModel.countDocuments();
    expect(actualDocumentsCount).toEqual(1);
  });

  it('should insert smart meter documents if the collection is empty', async () => {
    const result = await seed();

    expect(result).toEqual(true);
    const actualDocumentsCount = await SmartMeterModel.countDocuments();
    expect(actualDocumentsCount).toBeGreaterThan(0);
    expect(actualDocumentsCount).toEqual(SmartMeterSeedData.length);
    for (const expectedSmartMeter of SmartMeterSeedData) {
      const actualSmartMeters = await SmartMeterModel.find({
        muid: expectedSmartMeter.muid
      });
      expect(actualSmartMeters).toHaveLength(1);
      expect(actualSmartMeters[0].muid).toEqual(expectedSmartMeter.muid);
      expect(actualSmartMeters[0].name).toEqual(expectedSmartMeter.name);
    }
  });
});

afterEach(async () => {
  await SmartMeterModel.deleteMany();
});

afterAll(async () => {
  await closeConnection();
  await mongoServer.stop();
});
