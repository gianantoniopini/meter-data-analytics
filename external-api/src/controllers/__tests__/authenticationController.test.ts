import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { initialize as initializeApp } from '../../app';

it('Authentication request with no email and password should fail', async () => {
  const app = initializeApp();

  const response = await request(app)
    .post('/api/v1/authentication/auth')
    .send();

  expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
  expect(response.body.status).toEqual(StatusCodes.BAD_REQUEST);
  expect(response.body.message).toEqual(
    'Email address or password not present'
  );
});

it('Authentication request with invalid email should fail', async () => {
  const app = initializeApp();

  const response = await request(app)
    .post('/api/v1/authentication/auth')
    .send({ email: 'invalidEmail', password: 'password123' });

  expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
  expect(response.body.status).toEqual(StatusCodes.BAD_REQUEST);
  expect(response.body.message).toEqual('Invalid email address or password');
});

it('Authentication request with invalid password should fail', async () => {
  const app = initializeApp();

  const response = await request(app)
    .post('/api/v1/authentication/auth')
    .send({ email: 'user123@noemail.com', password: 'invalidPassword' });

  expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
  expect(response.body.status).toEqual(StatusCodes.BAD_REQUEST);
  expect(response.body.message).toEqual('Invalid email address or password');
});

it('Authentication request with valid email and password should succeed', async () => {
  const app = initializeApp();

  const response = await request(app)
    .post('/api/v1/authentication/auth')
    .send({ email: 'user123@noemail.com', password: 'password123' });

  expect(response.status).toEqual(StatusCodes.OK);
  expect(response.body.status).toEqual(StatusCodes.OK);
});

it('Authentication request with valid email and password should return cookie with access token', async () => {
  const app = initializeApp();

  const response = await request(app)
    .post('/api/v1/authentication/auth')
    .send({ email: 'user123@noemail.com', password: 'password123' });

  expect(response.headers['set-cookie']).toBeTruthy();
  expect(response.headers['set-cookie']).toHaveLength(1);
  const accessTokenCookie = response.headers['set-cookie'][0] as string;
  expect(accessTokenCookie).toBeTruthy();
  const accessToken = accessTokenCookie.split(';')[0];
  expect(accessToken.split('=')).toHaveLength(2);
  const accessTokenKey = accessToken.split('=')[0];
  expect(accessTokenKey).toEqual('access_token');
  const accessTokenValue = accessToken.split('=')[1];
  expect(accessTokenValue).toBeTruthy();
  expect(accessTokenValue.trim()).toBeTruthy();
  const maxAge = accessTokenCookie.split(';')[1];
  expect(maxAge.split('=')).toHaveLength(2);
  const maxAgeKey = maxAge.split('=')[0];
  expect(maxAgeKey.trim()).toEqual('Max-Age');
  const maxAgeValue = maxAge.split('=')[1];
  expect(maxAgeValue).toBeTruthy();
  expect(maxAgeValue).toEqual('600');
});

it('Authentication request should fail if access token secret is not present in user environment', async () => {
  delete process.env.AUTH_ACCESS_TOKEN_SECRET;
  const app = initializeApp();

  const response = await request(app)
    .post('/api/v1/authentication/auth')
    .send({ email: 'user123@noemail.com', password: 'password123' });

  expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
  expect(response.body.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
  expect(response.body.message).toEqual('secretOrPrivateKey must have a value');
});
