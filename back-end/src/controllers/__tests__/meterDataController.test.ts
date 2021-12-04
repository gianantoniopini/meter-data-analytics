import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { connect, Connection } from 'mongoose';
import { initialize as initializeApp } from '../../app';
import { Measurement } from '../../interfaces/Measurement';
import MeasurementModel from '../../models/MeasurementModel';

let mongoDbConnection: Connection | undefined;

beforeAll(async () => {
  const { connection } = await connect(process.env.MONGO_URI as string);
  mongoDbConnection = connection;
});

it('Measurement request should return data from MongoDB', async () => {
  const muid = '09a2bc02-2f88-4d01-ae59-a7f60c4a0dd1';
  const expectedMeasurement = {
    measurement: 'power',
    timestamp: '2021-05-01T00:00:00Z',
    tags: { muid: muid },
    '0100010700FF': 45.218634000536525,
    '0100020700FF': 0,
    '0100100700FF': 45.218634000536525
  };
  const measurementModel = new MeasurementModel(expectedMeasurement);
  await measurementModel.save();

  const app = initializeApp();

  const response = await request(app)
    .get(`/api/v1/meterdata/measurement?muid=${muid}`)
    .send();

  expect(response.status).toEqual(StatusCodes.OK);
  expect(response.body.status).toEqual(StatusCodes.OK);
  expect(response.body.data).toBeTruthy();
  const actualMeasurements = response.body.data as Measurement[];
  expect(actualMeasurements).toHaveLength(1);
  expect(actualMeasurements[0].measurement).toEqual(
    expectedMeasurement.measurement
  );
  expect(new Date(actualMeasurements[0].timestamp)).toEqual(
    new Date(expectedMeasurement.timestamp)
  );
  expect(actualMeasurements[0].tags).toEqual(expectedMeasurement.tags);
  expect(actualMeasurements[0]['0100010700FF']).toEqual(
    expectedMeasurement['0100010700FF']
  );
  expect(actualMeasurements[0]['0100020700FF']).toEqual(
    expectedMeasurement['0100020700FF']
  );
  expect(actualMeasurements[0]['0100100700FF']).toEqual(
    expectedMeasurement['0100100700FF']
  );
});

afterAll(async () => {
  if (mongoDbConnection) {
    await mongoDbConnection.close();
    mongoDbConnection = undefined;
  }
});
