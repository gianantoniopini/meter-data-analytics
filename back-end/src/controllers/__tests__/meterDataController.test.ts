import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { connect, Connection } from 'mongoose';
import { initialize as initializeApp } from '../../app';
import { Measurement } from '../../interfaces/Measurement';
import MeasurementModel from '../../models/MeasurementModel';

let mongoDbConnection: Connection | undefined;

const setupMeasurements = async (
  muid: string,
  timestampStart: Date,
  count: number
): Promise<Measurement[]> => {
  const measurements: Measurement[] = [];

  const indexes = [...Array(count).keys()].map((i) => i);
  for (const index of indexes) {
    const timestamp =
      index === 0
        ? timestampStart
        : new Date(timestampStart.getTime() + 15 * (index + 1) * 60000);

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
  const { connection } = await connect(process.env.MONGO_URI as string);
  mongoDbConnection = connection;
});

it('Measurement request with no muid query parameter should fail', async () => {
  const app = initializeApp();

  const response = await request(app)
    .get('/api/v1/meterdata/measurement')
    .send();

  expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
  expect(response.body.status).toEqual(StatusCodes.BAD_REQUEST);
  expect(response.body.message).toEqual('muid query parameter not present');
});

it('Measurement request should return measurements filtered by muid', async () => {
  const muid = '09a2bc02-2f88-4d01-ae59-a7f60c4a0dd1';
  const expectedMeasurements = await setupMeasurements(
    muid,
    new Date('2021-05-01T00:00:00Z'),
    1
  );
  const expectedMeasurement = expectedMeasurements[0];

  await setupMeasurements('other-muid', new Date('2021-06-01T00:00:00Z'), 10);

  const app = initializeApp();

  const response = await request(app)
    .get(`/api/v1/meterdata/measurement?muid=${muid}&limit=100000`)
    .send();

  expect(response.status).toEqual(StatusCodes.OK);
  expect(response.body.status).toEqual(StatusCodes.OK);
  expect(response.body.data).toBeTruthy();
  const actualMeasurements = response.body.data as Measurement[];
  expect(actualMeasurements).toHaveLength(1);
  const actualMeasurement = actualMeasurements[0];
  expect(actualMeasurement.tags.muid).toEqual(muid);
  expect(actualMeasurement.measurement).toEqual(
    expectedMeasurement.measurement
  );
  expect(new Date(actualMeasurement.timestamp)).toEqual(
    new Date(expectedMeasurement.timestamp)
  );
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

it('Measurement request should return a max number of measurements as per limit query parameter', async () => {
  const muid = '09a2bc02-2f88-4d01-ae59-a7f60c4a0dd1';
  await setupMeasurements(muid, new Date('2021-05-01T00:00:00Z'), 100);

  const app = initializeApp();

  const limit = 10;

  const response = await request(app)
    .get(`/api/v1/meterdata/measurement?muid=${muid}&limit=${limit}`)
    .send();

  expect(response.status).toEqual(StatusCodes.OK);
  expect(response.body.status).toEqual(StatusCodes.OK);
  expect(response.body.data).toBeTruthy();
  const actualMeasurements = response.body.data as Measurement[];
  expect(actualMeasurements).toHaveLength(limit);
  for (const actualMeasurement of actualMeasurements) {
    expect(actualMeasurement.tags.muid).toEqual(muid);
  }
});

afterEach(async () => {
  await MeasurementModel.deleteMany();
});

afterAll(async () => {
  if (!mongoDbConnection) {
    return;
  }

  await mongoDbConnection.close();
  mongoDbConnection = undefined;
});
