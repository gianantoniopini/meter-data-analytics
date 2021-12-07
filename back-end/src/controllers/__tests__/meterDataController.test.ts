import { Application } from 'express';
import { StatusCodes } from 'http-status-codes';
import { connect, Connection } from 'mongoose';
import got from 'got';
import { CookieJar } from 'tough-cookie';
import { mocked } from 'ts-jest/utils';
import request from 'supertest';
import { initialize as initializeApp } from '../../app';
import { Measurement } from '../../interfaces/Measurement';
import MeasurementModel from '../../models/MeasurementModel';

jest.mock('got');
const mockedGot = mocked(got);

let mongoDbConnection: Connection | undefined;
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

const setupExternalApiAuthenticationRequest = (): {
  accessTokenKey: string;
  accessTokenValue: string;
  maxAge: number;
  path: string;
  expires: string;
  httpOnly: boolean;
} => {
  const accessTokenKey = 'access_token';
  const accessTokenValue =
    'sdjfkasfjksajfksajfskdjafslakf.skdfjskfjskafjskafjskadfjs3485783skfskfjskfjsf.skadfksdfjdfk_fdjdskafjsdfjsfkjsafjsdkfJJkasjdfkjsfj89';
  const maxAge = 600;
  const path = '/';
  const expires = '2021-12-07T15:57:45.000Z';

  const cookieValue = `${accessTokenKey}=${accessTokenValue}; Max-Age=${maxAge}; Path=${path}; Expires=${expires}; HttpOnly`;

  mockedGot.post = jest.fn().mockResolvedValue({
    headers: {
      'set-cookie': [cookieValue]
    }
  });

  return {
    accessTokenKey,
    accessTokenValue,
    maxAge,
    path,
    expires,
    httpOnly: true
  };
};

beforeAll(async () => {
  try {
    const { connection } = await connect(process.env.MONGO_URI as string);
    mongoDbConnection = connection;

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

describe('POST /meterdata/measurement/import request', () => {
  const requestUrl = '/api/v1/meterdata/measurement/import';

  it('with no muid body parameter should fail', async () => {
    const response = await request(app).post(requestUrl).send({});

    expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(response.body.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(response.body.message).toEqual('muid body parameter not present');
  });

  it('should make external-api authentication request', async () => {
    const muid = '09a2bc02-2f88-4d01-ae59-a7f60c4a0dd1';

    await request(app).post(requestUrl).send({ muid });

    expect(mockedGot.post).toHaveBeenCalledTimes(1);
    expect(mockedGot.post).toHaveBeenCalledWith(
      process.env.EXTERNAL_API_AUTH_URL,
      {
        json: {
          email: process.env.EXTERNAL_API_AUTH_EMAIL,
          password: process.env.EXTERNAL_API_AUTH_PWD
        },
        responseType: 'json'
      }
    );
  });

  it('should fail if external-api authentication request returns error', async () => {
    const errorMessage = 'Invalid email address or password';
    mockedGot.post = jest.fn().mockRejectedValue(new Error(errorMessage));

    const muid = '09a2bc02-2f88-4d01-ae59-a7f60c4a0dd1';

    const response = await request(app).post(requestUrl).send({ muid });

    expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.body.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.body.message).toEqual(errorMessage);
  });

  it('should make external-api measurement request', async () => {
    const now = new Date();

    const externalApiAuthenticationCookie =
      setupExternalApiAuthenticationRequest();

    const muid = '09a2bc02-2f88-4d01-ae59-a7f60c4a0dd1';
    const start = '2021-04-30T23:59:59Z';
    const stop = '2021-07-01T23:59:59Z';
    const limit = 100000;

    await request(app).post(requestUrl).send({ muid, start, stop, limit });

    expect(mockedGot.get).toHaveBeenCalledTimes(1);
    const mockedGet = mockedGot.get as jest.Mock;
    expect(mockedGet.mock.calls[0][0]).toEqual(
      `${process.env.EXTERNAL_API_MEASUREMENT_URL}?muid=${muid}&start=${start}&stop=${stop}&limit=${limit}`
    );
    const cookieJar = (
      mockedGet.mock.calls[0][1].cookieJar as CookieJar
    ).toJSON();
    const cookie = cookieJar.cookies[0];
    expect(cookie.key).toEqual(externalApiAuthenticationCookie.accessTokenKey);
    expect(cookie.value).toEqual(
      externalApiAuthenticationCookie.accessTokenValue
    );
    expect(cookie.maxAge).toEqual(externalApiAuthenticationCookie.maxAge);
    expect(cookie.path).toEqual(externalApiAuthenticationCookie.path);
    expect(cookie.httpOnly).toEqual(externalApiAuthenticationCookie.httpOnly);
    expect(new Date(cookie.creation) >= now).toBe(true);
    expect(new Date(cookie.lastAccessed) >= now).toBe(true);
  });

  it('should fail if external-api measurement request returns error', async () => {
    setupExternalApiAuthenticationRequest();

    const errorMessage = 'Token invalid';
    mockedGot.get = jest.fn().mockRejectedValue(new Error(errorMessage));

    const muid = '09a2bc02-2f88-4d01-ae59-a7f60c4a0dd1';

    const response = await request(app).post(requestUrl).send({ muid });

    expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.body.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.body.message).toEqual(errorMessage);
  });
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
