import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { initialize as initializeApp } from '../../app';

describe('POST /authentication/auth request', () => {
  const requestUrl = `${process.env.BASE_PATH as string}/authentication/auth`;
  const validEmail = 'user123@noemail.com';
  const validPassword = 'password123';

  it('with no email and password should fail', async () => {
    const app = initializeApp();

    const response = await request(app).post(requestUrl).send();

    expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(response.body.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(response.body.message).toEqual(
      'Email address or password not present'
    );
  });

  it('with invalid email should fail', async () => {
    const app = initializeApp();

    const response = await request(app)
      .post(requestUrl)
      .send({ email: 'invalidEmail', password: validPassword });

    expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(response.body.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(response.body.message).toEqual('Invalid email address or password');
  });

  it('with invalid password should fail', async () => {
    const app = initializeApp();

    const response = await request(app)
      .post(requestUrl)
      .send({ email: validEmail, password: 'invalidPassword' });

    expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(response.body.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(response.body.message).toEqual('Invalid email address or password');
  });

  it('with valid email and password should succeed', async () => {
    const app = initializeApp();

    const response = await request(app)
      .post(requestUrl)
      .send({ email: validEmail, password: validPassword });

    expect(response.status).toEqual(StatusCodes.OK);
    expect(response.body.status).toEqual(StatusCodes.OK);
  });

  it('with valid email and password should return cookie with access token', async () => {
    const app = initializeApp();
    const setCookieHeaderName = 'set-cookie';

    const response = await request(app)
      .post(requestUrl)
      .send({ email: validEmail, password: validPassword });

    expect(response.headers[setCookieHeaderName]).toBeTruthy();
    expect(response.headers[setCookieHeaderName]).toHaveLength(1);
    const accessTokenCookie = response.headers[
      setCookieHeaderName
    ][0] as string;
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

  it('should fail if access token secret is not present in user environment', async () => {
    delete process.env.AUTH_ACCESS_TOKEN_SECRET;
    const app = initializeApp();

    const response = await request(app)
      .post(requestUrl)
      .send({ email: validEmail, password: validPassword });

    expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.body.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.body.message).toEqual(
      'secretOrPrivateKey must have a value'
    );
  });

  it('should fail if more than 100 requests are made from the same IP within 15 minutes', async () => {
    const app = initializeApp();
    const indexes = [...Array.from({ length: 100 }).keys()].map(
      (index) => index
    );

    for (const index of indexes) {
      const response = await request(app)
        .post(requestUrl)
        .send({ email: validEmail, password: `invalidPassword-${index}` });

      expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
    }

    const response = await request(app)
      .post(requestUrl)
      .send({ email: validEmail, password: 'invalidPassword' });

    expect(response.status).toEqual(StatusCodes.TOO_MANY_REQUESTS);
    expect(response.text).toEqual('Too many requests, please try again later.');
  });
});
