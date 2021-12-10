import { Application } from 'express';
import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { openConnection, closeConnection } from '../../database';
import got, { OptionsOfJSONResponseBody } from 'got';
import { Cookie, CookieJar } from 'tough-cookie';
import { mocked } from 'ts-jest/utils';
import { initialize as initializeApp } from '../../app';
import MeasurementModel from '../../models/MeasurementModel';
import { ExternalApiMeasurementResponse } from '../../interfaces/ExternalApiMeasurementResponse';
import { ExternalApiMeasurement } from '../../interfaces/ExternalApiMeasurement';
import { setupMeasurements } from './helpers/meterDataControllerHelper';

jest.mock('got');
const mockedGot = mocked(got);

let mongoServer: MongoMemoryServer;
let app: Application;

const mockExternalApiAuthenticationRequest = (): Cookie => {
  const accessTokenKey = 'access_token';
  const accessTokenValue =
    'veryLongAlphanumericString.skdfjskfjskafjskafjskadfjs3485783skfskfjskfjsf.skadfksdfjdfk_fdjdskafjsdfjsfkjsafjsdkfJJkasjdfkjsfj89';
  const maxAge = 600;
  const path = '/';
  const expires = new Date(new Date().getTime() + maxAge * 1000);

  const cookieString = `${accessTokenKey}=${accessTokenValue}; Max-Age=${maxAge}; Path=${path}; Expires=${expires.toUTCString()}; HttpOnly`;
  const cookie = Cookie.parse(cookieString) as Cookie;

  mockedGot.post = jest.fn().mockResolvedValue({
    headers: {
      'set-cookie': [cookieString]
    }
  });

  return cookie;
};

export const mockExternalApiMeasurementRequest = (
  muid: string,
  timestampStart: Date,
  count: number
): ExternalApiMeasurement[] => {
  const measurements: ExternalApiMeasurement[] = [];

  const indexes = [...Array(count).keys()].map((i) => i);
  for (const index of indexes) {
    // One measurement every 15 minutes
    const timestamp = new Date(timestampStart.getTime() + 15 * index * 60000);

    // Random power value between 0 and 5000
    const powerValue = Math.random() * 5000;

    const measurement: ExternalApiMeasurement = {
      measurement: 'power',
      timestamp: timestamp,
      tags: { muid: muid },
      '0100010700FF': powerValue,
      '0100020700FF': 0,
      '0100100700FF': powerValue
    };

    measurements.push(measurement);
  }

  const responseBody: ExternalApiMeasurementResponse = { data: measurements };

  mockedGot.get = jest.fn().mockResolvedValue({
    body: responseBody
  });

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

describe('POST /meterdata/measurement/import request', () => {
  const requestUrl = `${
    process.env.BASE_PATH as string
  }/meterdata/measurement/import`;

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
    const externalApiCookieDomainUrl = process.env
      .EXTERNAL_API_COOKIE_DOMAIN_URL as string;

    const expectedAuthenticationCookie = mockExternalApiAuthenticationRequest();

    const muid = '09a2bc02-2f88-4d01-ae59-a7f60c4a0dd1';
    const start = '2021-04-30T23:59:59Z';
    const stop = '2021-07-01T23:59:59Z';
    const limit = 100000;

    await request(app).post(requestUrl).send({ muid, start, stop, limit });

    expect(mockedGot.get).toHaveBeenCalledTimes(1);
    const mockedGet = mockedGot.get as jest.Mock;
    const mockedGetCallUrl = mockedGet.mock.calls[0][0] as string;
    expect(mockedGetCallUrl).toEqual(
      `${process.env.EXTERNAL_API_MEASUREMENT_URL}?muid=${muid}&start=${start}&stop=${stop}&limit=${limit}`
    );
    const mockedGetCallOptions = mockedGet.mock
      .calls[0][1] as OptionsOfJSONResponseBody;
    expect(mockedGetCallOptions).toBeDefined();
    const mockedGetCallCookieJar = mockedGetCallOptions.cookieJar as CookieJar;
    expect(mockedGetCallCookieJar).toBeDefined();
    const mockedGetCallCookies = await mockedGetCallCookieJar.getCookies(
      externalApiCookieDomainUrl
    );
    expect(mockedGetCallCookies).toHaveLength(1);
    const mockedGetCallCookie = mockedGetCallCookies[0];
    expect(mockedGetCallCookie.key).toEqual(expectedAuthenticationCookie.key);
    expect(mockedGetCallCookie.value).toEqual(
      expectedAuthenticationCookie.value
    );
    expect(mockedGetCallCookie.maxAge).toEqual(
      expectedAuthenticationCookie.maxAge
    );
    expect(mockedGetCallCookie.path).toEqual(expectedAuthenticationCookie.path);
    expect(mockedGetCallCookie.expires).toEqual(
      expectedAuthenticationCookie.expires
    );
    expect(mockedGetCallCookie.httpOnly).toEqual(
      expectedAuthenticationCookie.httpOnly
    );
  });

  it('should fail if external-api measurement request returns error', async () => {
    mockExternalApiAuthenticationRequest();

    const errorMessage = 'Token invalid';
    mockedGot.get = jest.fn().mockRejectedValue(new Error(errorMessage));

    const muid = '09a2bc02-2f88-4d01-ae59-a7f60c4a0dd1';

    const response = await request(app).post(requestUrl).send({ muid });

    expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.body.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.body.message).toEqual(errorMessage);
  });

  it('should delete all measurements with the same muid already in the database', async () => {
    const muid = '09a2bc02-2f88-4d01-ae59-a7f60c4a0dd1';
    const timestamp = new Date('2021-05-01T00:00:00Z');
    const existingMeasurementsWithSameMuid = await setupMeasurements(
      muid,
      timestamp,
      10
    );
    const otherMuid = 'other-muid';
    await setupMeasurements(otherMuid, timestamp, 20);

    mockExternalApiAuthenticationRequest();
    mockExternalApiMeasurementRequest(muid, timestamp, 30);

    await request(app).post(requestUrl).send({ muid });

    expect(await MeasurementModel.count({})).toEqual(50);
    expect(
      await MeasurementModel.find({
        _id: { $in: existingMeasurementsWithSameMuid.map((m) => m._id) }
      })
    ).toHaveLength(0);
    expect(
      await MeasurementModel.find({ tags: { muid: otherMuid } })
    ).toHaveLength(20);
  });
});

afterEach(async () => {
  await MeasurementModel.deleteMany();
});

afterAll(async () => {
  await closeConnection();
  await mongoServer.stop();
});
