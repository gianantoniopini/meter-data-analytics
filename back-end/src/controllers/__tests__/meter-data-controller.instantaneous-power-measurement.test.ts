import { Application } from 'express';
import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { openConnection, closeConnection } from '../../database';
import { initialize as initializeApp } from '../../app';
import Measurement from '@shared/interfaces/measurement.interface';
import WeekdayAveragePower from '@shared/interfaces/weekday-average-power.interface';
import HourAveragePower from '@shared/interfaces/hour-average-power.interface';
import MeasurementModel, {
  powerMeasurement
} from '../../models/measurement.model';
import { setupMeasurements } from './helpers/meter-data-controller-helper';

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

describe('GET /meterdata/measurement/instantaneouspower request', () => {
  const requestUrl = `${
    process.env.BASE_PATH as string
  }/meterdata/measurement/instantaneouspower`;

  const muid = '09a2bc02-2f88-4d01-ae59-a7f60c4a0dd1';
  const timestamp = new Date('2021-05-01T00:00:00Z');

  it('with no muid query parameter should fail', async () => {
    const response = await request(app).get(requestUrl).send();

    expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(response.body.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(response.body.message).toEqual(
      'muid parameter not present in request'
    );
    expect(response.body.data).not.toBeDefined();
  });

  it('should return measurements filtered by muid', async () => {
    const expectedMeasurements = await setupMeasurements(
      muid,
      timestamp,
      powerMeasurement,
      1
    );
    const expectedMeasurement = expectedMeasurements[0];

    await setupMeasurements(
      'other-muid',
      new Date('2021-06-01T00:00:00Z'),
      powerMeasurement,
      10
    );

    const response = await request(app)
      .get(`${requestUrl}?muid=${muid}&limit=100000`)
      .send();

    expect(response.status).toEqual(StatusCodes.OK);
    expect(response.body.status).toEqual(StatusCodes.OK);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.timeSeries).toBeDefined();
    const actualMeasurements = response.body.data.timeSeries as Measurement[];
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

  it('should filter out non-power measurements', async () => {
    await setupMeasurements(muid, timestamp, powerMeasurement, 10);
    await setupMeasurements(muid, timestamp, 'water', 20);

    const response = await request(app)
      .get(`${requestUrl}?muid=${muid}&limit=100000`)
      .send();

    expect(response.status).toEqual(StatusCodes.OK);
    expect(response.body.status).toEqual(StatusCodes.OK);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.timeSeries).toBeDefined();
    const actualMeasurements = response.body.data.timeSeries as Measurement[];
    expect(actualMeasurements).toHaveLength(10);
    const actualPowerMeasurements = actualMeasurements.filter(
      (m) => m.measurement === powerMeasurement
    );
    expect(actualPowerMeasurements).toHaveLength(10);
    const actualWaterMeasurements = actualMeasurements.filter(
      (m) => m.measurement === 'water'
    );
    expect(actualWaterMeasurements).toHaveLength(0);
  });

  it('should return a max number of measurements as per limit query parameter', async () => {
    await setupMeasurements(muid, timestamp, powerMeasurement, 100);

    const limit = 10;

    const response = await request(app)
      .get(`${requestUrl}?muid=${muid}&limit=${limit}`)
      .send();

    expect(response.status).toEqual(StatusCodes.OK);
    expect(response.body.status).toEqual(StatusCodes.OK);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.timeSeries).toBeDefined();
    const actualMeasurements = response.body.data.timeSeries as Measurement[];
    expect(actualMeasurements).toHaveLength(limit);
  });

  it('with start and stop query parameters should return measurements filtered by timestamp', async () => {
    const measurements = await setupMeasurements(
      muid,
      timestamp,
      powerMeasurement,
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
    expect(response.body.data.timeSeries).toBeDefined();
    const actualMeasurements = response.body.data.timeSeries as Measurement[];
    expect(actualMeasurements).toHaveLength(21);
    const actualFirstMeasurementTimestamp = Math.min(
      ...actualMeasurements.map((m) => new Date(m.timestamp).getTime())
    );
    const actualFirstMeasurement = actualMeasurements.find(
      (m) => new Date(m.timestamp).getTime() === actualFirstMeasurementTimestamp
    ) as Measurement;
    expect(actualFirstMeasurement._id.toString()).toEqual(
      expectedFirstMeasurement._id.toString()
    );
    expect(new Date(actualFirstMeasurement.timestamp)).toEqual(
      expectedFirstMeasurement.timestamp
    );
    const actualLastMeasurementTimestamp = Math.max(
      ...actualMeasurements.map((m) => new Date(m.timestamp).getTime())
    );
    const actualLastMeasurement = actualMeasurements.find(
      (m) => new Date(m.timestamp).getTime() === actualLastMeasurementTimestamp
    ) as Measurement;
    expect(actualLastMeasurement._id.toString()).toEqual(
      expectedLastMeasurement._id.toString()
    );
    expect(new Date(actualLastMeasurement.timestamp)).toEqual(
      expectedLastMeasurement.timestamp
    );
  });

  it('should return average power by weekday analytics', async () => {
    await setupMeasurements(muid, timestamp, powerMeasurement, 1000);
    const isoWeekdays = [...Array.from({ length: 7 }).keys()].map(
      (index) => index + 1
    );

    const response = await request(app)
      .get(`${requestUrl}?muid=${muid}&limit=100000`)
      .send();

    expect(response.body.data.analytics.averagePowerByWeekday).toBeDefined();
    const actualAveragePowerByWeekdayArray = response.body.data.analytics
      .averagePowerByWeekday as WeekdayAveragePower[];
    expect(actualAveragePowerByWeekdayArray).toHaveLength(isoWeekdays.length);
    for (const isoWeekday of isoWeekdays) {
      const averagePowerByWeekday = actualAveragePowerByWeekdayArray.find(
        (wap) => wap.isoWeekday === isoWeekday
      );
      expect(averagePowerByWeekday).toBeDefined();
      expect(
        (averagePowerByWeekday as WeekdayAveragePower).averagePower
      ).toBeGreaterThan(0);
    }
  });

  it('should return average power by hour analytics', async () => {
    await setupMeasurements(muid, timestamp, powerMeasurement, 100);
    const hours = [...Array.from({ length: 24 }).keys()].map((index) => index);

    const response = await request(app)
      .get(`${requestUrl}?muid=${muid}&limit=100000`)
      .send();

    expect(response.body.data.analytics.averagePowerByHour).toBeDefined();
    const actualAveragePowerByHourArray = response.body.data.analytics
      .averagePowerByHour as HourAveragePower[];
    expect(actualAveragePowerByHourArray).toHaveLength(hours.length);
    for (const hour of hours) {
      const averagePowerByHour = actualAveragePowerByHourArray.find(
        (hap) => hap.hour === hour
      );
      expect(averagePowerByHour).toBeDefined();
      expect(
        (averagePowerByHour as HourAveragePower).averagePower
      ).toBeGreaterThan(0);
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
  await MeasurementModel.deleteMany();
});

afterAll(async () => {
  await closeConnection();
  await mongoServer.stop();
});
