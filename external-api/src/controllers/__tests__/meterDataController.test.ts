import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { app } from '../../app';
import Measurement from '../../interfaces/Measurement';

const getAccessToken = async (): Promise<string> => {
  const authResponse = await request(app)
    .post('/api/v1/authentication/auth')
    .send({ email: 'user123@noemail.com', password: 'password123' });

  const accessTokenCookie = authResponse.headers['set-cookie'][0] as string;

  return accessTokenCookie;
};

it('Measurement request with no access token should fail', async () => {
  const response = await request(app)
    .get(
      '/api/v1/meterdata/measurement?muid=09a2bc02-2f88-4d01-ae59-a7f60c4a0dd1'
    )
    .send();

  expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
  expect(response.body.status).toEqual(StatusCodes.BAD_REQUEST);
  expect(response.body.message).toEqual('Token not present');
});

it('Measurement request with invalid access token should fail', async () => {
  const response = await request(app)
    .get(
      '/api/v1/meterdata/measurement?muid=09a2bc02-2f88-4d01-ae59-a7f60c4a0dd1'
    )
    .set('Cookie', ['access_token=1234567890'])
    .send();

  expect(response.status).toEqual(StatusCodes.FORBIDDEN);
  expect(response.body.status).toEqual(StatusCodes.FORBIDDEN);
  expect(response.body.message).toEqual('Token invalid');
});

it('Measurement request with valid access token should succeed', async () => {
  const accessTokenCookie = await getAccessToken();

  const response = await request(app)
    .get(
      '/api/v1/meterdata/measurement?muid=09a2bc02-2f88-4d01-ae59-a7f60c4a0dd1'
    )
    .set('Cookie', accessTokenCookie)
    .send();

  expect(response.status).toEqual(StatusCodes.OK);
  expect(response.body.status).toEqual(StatusCodes.OK);
});

it('Measurement request with no muid query parameter should fail', async () => {
  const accessTokenCookie = await getAccessToken();

  const response = await request(app)
    .get('/api/v1/meterdata/measurement?muid=')
    .set('Cookie', accessTokenCookie)
    .send();

  expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
  expect(response.body.status).toEqual(StatusCodes.BAD_REQUEST);
  expect(response.body.message).toEqual('muid query parameter not present');
});

it('Measurement request with no limit query parameter should return just one measurement', async () => {
  const accessTokenCookie = await getAccessToken();

  const response = await request(app)
    .get(
      '/api/v1/meterdata/measurement?muid=09a2bc02-2f88-4d01-ae59-a7f60c4a0dd1'
    )
    .set('Cookie', accessTokenCookie)
    .send();

  const measurements = response.body.data as Measurement[];
  expect(measurements).toHaveLength(1);
});

it('Measurement request should return a max number of measurements as per limit query parameter', async () => {
  const accessTokenCookie = await getAccessToken();

  const response = await request(app)
    .get(
      '/api/v1/meterdata/measurement?muid=09a2bc02-2f88-4d01-ae59-a7f60c4a0dd1&limit=100'
    )
    .set('Cookie', accessTokenCookie)
    .send();

  const measurements = response.body.data as Measurement[];
  expect(measurements).toHaveLength(100);
});
