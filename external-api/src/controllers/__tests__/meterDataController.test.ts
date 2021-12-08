import { Application } from 'express';
import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { initialize as initializeApp } from '../../app';
import Measurement from '../../interfaces/Measurement';

const getAccessToken = async (app: Application): Promise<string> => {
  const authResponse = await request(app)
    .post('/api/v1/authentication/auth')
    .send({ email: 'user123@noemail.com', password: 'password123' });

  const accessTokenCookie = authResponse.headers['set-cookie'][0] as string;

  return accessTokenCookie;
};

afterEach(() => {
  jest.useRealTimers();
});

describe('GET /meterdata/measurement request', () => {
  const requestUrl = `${process.env.BASE_PATH as string}/meterdata/measurement`;

  it('with no access token should fail', async () => {
    const app = initializeApp();

    const response = await request(app)
      .get(`${requestUrl}?muid=09a2bc02-2f88-4d01-ae59-a7f60c4a0dd1`)
      .send();

    expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(response.body.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(response.body.message).toEqual('Token not present');
  });

  it('with invalid access token should fail', async () => {
    const app = initializeApp();

    const response = await request(app)
      .get(`${requestUrl}?muid=09a2bc02-2f88-4d01-ae59-a7f60c4a0dd1`)
      .set('Cookie', ['access_token=1234567890'])
      .send();

    expect(response.status).toEqual(StatusCodes.FORBIDDEN);
    expect(response.body.status).toEqual(StatusCodes.FORBIDDEN);
    expect(response.body.message).toEqual('Token invalid');
  });

  it('with valid access token should succeed', async () => {
    const app = initializeApp();
    const accessTokenCookie = await getAccessToken(app);

    const response = await request(app)
      .get(`${requestUrl}?muid=09a2bc02-2f88-4d01-ae59-a7f60c4a0dd1`)
      .set('Cookie', accessTokenCookie)
      .send();

    expect(response.status).toEqual(StatusCodes.OK);
    expect(response.body.status).toEqual(StatusCodes.OK);
  });

  it('with access token older than 10 minutes should fail', async () => {
    jest.useFakeTimers();
    const app = initializeApp();
    const accessTokenCookie = await getAccessToken(app);

    jest.advanceTimersByTime(11 * 60 * 1000); // 11 minutes
    const response = await request(app)
      .get(`${requestUrl}?muid=09a2bc02-2f88-4d01-ae59-a7f60c4a0dd1`)
      .set('Cookie', accessTokenCookie)
      .send();

    expect(response.status).toEqual(StatusCodes.FORBIDDEN);
    expect(response.body.status).toEqual(StatusCodes.FORBIDDEN);
    expect(response.body.message).toEqual('Token invalid');
  });

  it('with no muid query parameter should fail', async () => {
    const app = initializeApp();
    const accessTokenCookie = await getAccessToken(app);

    const response = await request(app)
      .get(`${requestUrl}?muid=`)
      .set('Cookie', accessTokenCookie)
      .send();

    expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(response.body.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(response.body.message).toEqual('muid query parameter not present');
  });

  it('with no limit query parameter should return just one measurement', async () => {
    const app = initializeApp();
    const accessTokenCookie = await getAccessToken(app);

    const response = await request(app)
      .get(`${requestUrl}?muid=09a2bc02-2f88-4d01-ae59-a7f60c4a0dd1`)
      .set('Cookie', accessTokenCookie)
      .send();

    const measurements = response.body.data as Measurement[];
    expect(measurements).toHaveLength(1);
  });

  it('should return a max number of measurements as per limit query parameter', async () => {
    const app = initializeApp();
    const accessTokenCookie = await getAccessToken(app);

    const response = await request(app)
      .get(`${requestUrl}?muid=09a2bc02-2f88-4d01-ae59-a7f60c4a0dd1&limit=100`)
      .set('Cookie', accessTokenCookie)
      .send();

    const measurements = response.body.data as Measurement[];
    expect(measurements).toHaveLength(100);
  });

  it('for a non-existent muid should return no measurements', async () => {
    const app = initializeApp();
    const accessTokenCookie = await getAccessToken(app);

    const response = await request(app)
      .get(`${requestUrl}?muid=non-existent-muid&limit=100`)
      .set('Cookie', accessTokenCookie)
      .send();

    expect(response.status).toEqual(StatusCodes.OK);
    expect(response.body.status).toEqual(StatusCodes.OK);
    const measurements = response.body.data as Measurement[];
    expect(measurements).toHaveLength(0);
  });

  it('with start and stop query parameters should return measurements filtered by timestamp', async () => {
    const app = initializeApp();
    const accessTokenCookie = await getAccessToken(app);

    const response = await request(app)
      .get(
        `${requestUrl}?muid=09a2bc02-2f88-4d01-ae59-a7f60c4a0dd1&start=2021-05-01T00:00:00Z&stop=2021-05-01T23:59:59Z&limit=100000`
      )
      .set('Cookie', accessTokenCookie)
      .send();

    const measurements = response.body.data as Measurement[];
    expect(measurements).toHaveLength(96);
    const timestamps = measurements.map((m) => new Date(m.timestamp));
    const minTimestamp = timestamps.reduce(function (a, b) {
      return a < b ? a : b;
    });
    expect(minTimestamp).toEqual(new Date('2021-05-01T00:00:00Z'));
    const maxTimestamp = timestamps.reduce(function (a, b) {
      return a > b ? a : b;
    });
    expect(maxTimestamp).toEqual(new Date('2021-05-01T23:45:00Z'));
  });
});
