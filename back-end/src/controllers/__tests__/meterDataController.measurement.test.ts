import { Application } from 'express';
import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { openConnection, closeConnection } from '../../database';
import { initialize as initializeApp } from '../../app';
import { Measurement } from '../../interfaces/Measurement';
import MeasurementModel from '../../models/MeasurementModel';

let mongoServer: MongoMemoryServer;
let app: Application;

const setupMeasurements = async (
  muid: string,
  timestampStart: Date,
  count: number
): Promise<Measurement[]> => {
  const measurements: Measurement[] = [];

  const indexes = [...Array(count).keys()].map((i) => i);
  for (const index of indexes) {
    // One measurement every 15 minutes
    const timestamp = new Date(timestampStart.getTime() + 15 * index * 60000);

    // Random power value between 0 and 5000
    const powerValue = Math.random() * 5000;

    const measurementModel = new MeasurementModel({
      measurement: 'power',
      timestamp: timestamp,
      tags: { muid: muid },
      '0100010700FF': powerValue,
      '0100020700FF': 0,
      '0100100700FF': powerValue
    });

    await measurementModel.save();

    measurements.push(measurementModel);
  }

  return measurements;
};

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

describe('GET /api/v1/meterdata/measurement request', () => {
  const requestUrl = '/api/v1/meterdata/measurement';

  it('with no muid query parameter should fail', async () => {
    const response = await request(app).get(requestUrl).send();

    expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(response.body.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(response.body.message).toEqual('muid query parameter not present');
    expect(response.body.data).not.toBeDefined();
  });

  it('should return measurements filtered by muid', async () => {
    const muid = '09a2bc02-2f88-4d01-ae59-a7f60c4a0dd1';
    const timestamp = new Date('2021-05-01T00:00:00Z');
    const expectedMeasurements = await setupMeasurements(muid, timestamp, 1);
    const expectedMeasurement = expectedMeasurements[0];

    await setupMeasurements('other-muid', new Date('2021-06-01T00:00:00Z'), 10);

    const response = await request(app)
      .get(`${requestUrl}?muid=${muid}&limit=100000`)
      .send();

    expect(response.status).toEqual(StatusCodes.OK);
    expect(response.body.status).toEqual(StatusCodes.OK);
    expect(response.body.data).toBeDefined();
    const actualMeasurements = response.body.data as Measurement[];
    expect(actualMeasurements).toHaveLength(1);
    const actualMeasurement = actualMeasurements[0];
    expect(actualMeasurement._id).toBeDefined();
    expect(actualMeasurement._id.toString()).toEqual(
      expectedMeasurement._id.toString()
    );
    expect(actualMeasurement.tags.muid).toEqual(muid);
    expect(actualMeasurement.measurement).toEqual(
      expectedMeasurement.measurement
    );
    expect(new Date(actualMeasurement.timestamp)).toEqual(timestamp);
    expect(actualMeasurement['0100010700FF']).toEqual(
      expectedMeasurement['0100010700FF']
    );
    expect(actualMeasurement['0100020700FF']).toEqual(
      expectedMeasurement['0100020700FF']
    );
    expect(actualMeasurement['0100100700FF']).toEqual(
      expectedMeasurement['0100100700FF']
    );
  });

  it('should return a max number of measurements as per limit query parameter', async () => {
    const muid = '09a2bc02-2f88-4d01-ae59-a7f60c4a0dd1';
    await setupMeasurements(muid, new Date('2021-05-01T00:00:00Z'), 100);

    const limit = 10;

    const response = await request(app)
      .get(`${requestUrl}?muid=${muid}&limit=${limit}`)
      .send();

    expect(response.status).toEqual(StatusCodes.OK);
    expect(response.body.status).toEqual(StatusCodes.OK);
    expect(response.body.data).toBeDefined();
    const actualMeasurements = response.body.data as Measurement[];
    expect(actualMeasurements).toHaveLength(limit);
  });

  it('with start and stop query parameters should return measurements filtered by timestamp', async () => {
    const muid = '09a2bc02-2f88-4d01-ae59-a7f60c4a0dd1';
    const measurements = await setupMeasurements(
      muid,
      new Date('2021-05-01T00:00:00Z'),
      100
    );
    const expectedFirstMeasurement = measurements[10];
    const expectedLastMeasurement = measurements[30];

    const response = await request(app)
      .get(
        `${requestUrl}?muid=${muid}&start=${expectedFirstMeasurement.timestamp.toISOString()}&stop=${expectedLastMeasurement.timestamp.toISOString()}&limit=100000`
      )
      .send();

    expect(response.status).toEqual(StatusCodes.OK);
    expect(response.body.status).toEqual(StatusCodes.OK);
    expect(response.body.data).toBeDefined();
    const actualMeasurements = response.body.data as Measurement[];
    expect(actualMeasurements).toHaveLength(21);
    const actualFirstMeasurement = actualMeasurements.reduce(function (a, b) {
      return a.timestamp < b.timestamp ? a : b;
    });
    expect(actualFirstMeasurement._id.toString()).toEqual(
      expectedFirstMeasurement._id.toString()
    );
    expect(new Date(actualFirstMeasurement.timestamp)).toEqual(
      expectedFirstMeasurement.timestamp
    );
    const actualLastMeasurement = actualMeasurements.reduce(function (a, b) {
      return a.timestamp > b.timestamp ? a : b;
    });
    expect(actualLastMeasurement._id.toString()).toEqual(
      expectedLastMeasurement._id.toString()
    );
    expect(new Date(actualLastMeasurement.timestamp)).toEqual(
      expectedLastMeasurement.timestamp
    );
  });
});

afterEach(async () => {
  await MeasurementModel.deleteMany();
});

afterAll(async () => {
  await closeConnection();
  await mongoServer.stop();
});
