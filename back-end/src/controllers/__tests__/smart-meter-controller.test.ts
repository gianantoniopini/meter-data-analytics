import { Application } from 'express';
import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { openConnection, closeConnection } from '../../database';
import { initialize as initializeApp } from '../../app';
import SmartMeter from '@shared/interfaces/smart-meter.interface';
import SmartMeterModel from '../../models/smart-meter.model';
import SmartMeterSeedData from '../../database/seed-data/smart-meter.seed-data';

let mongoServer: MongoMemoryServer;
let app: Application;

beforeAll(async () => {
  try {
    mongoServer = await MongoMemoryServer.create();
    await openConnection(mongoServer.getUri());

    app = initializeApp();
  } catch (error) {
    console.error(error);
    throw error;
  }
});

describe('GET /meterdata/smartmeter request', () => {
  const requestUrl = `${process.env.BASE_PATH as string}/meterdata/smartmeter`;

  it('should return all smart meters', async () => {
    await SmartMeterModel.insertMany(SmartMeterSeedData);
    const expectedSmartMeters = await SmartMeterModel.find();

    const response = await request(app).get(requestUrl).send();

    expect(response.status).toEqual(StatusCodes.OK);
    expect(response.body.status).toEqual(StatusCodes.OK);
    expect(response.body.data).toBeDefined();
    const actualSmartMeters = response.body.data as SmartMeter[];
    expect(actualSmartMeters.length).toBeGreaterThan(0);
    expect(actualSmartMeters).toHaveLength(expectedSmartMeters.length);
    for (const expectedSmartMeter of expectedSmartMeters) {
      const actualSmartMetersFiltered = actualSmartMeters.filter(
        (sm) => sm._id.toString() === expectedSmartMeter._id.toString()
      );
      expect(actualSmartMetersFiltered).toHaveLength(1);
      expect(actualSmartMetersFiltered[0].muid).toEqual(
        expectedSmartMeter.muid
      );
      expect(actualSmartMetersFiltered[0].name).toEqual(
        expectedSmartMeter.name
      );
    }
  });

  it('should fail if more than 100 requests are made from the same IP within 15 minutes', async () => {
    let index = 0;
    while (index < 100) {
      await request(app).get(requestUrl).send();
      index++;
    }

    const response = await request(app).get(requestUrl).send();

    expect(response.status).toEqual(StatusCodes.TOO_MANY_REQUESTS);
    expect(response.text).toEqual('Too many requests, please try again later.');
  });
});

afterEach(async () => {
  await SmartMeterModel.deleteMany();
});

afterAll(async () => {
  await closeConnection();
  await mongoServer.stop();
});
