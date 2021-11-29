import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { app } from '../../app';

it('Authentication request with no email and password should fail', async () => {
  const result = await request(app).post('/api/v1/authentication/auth').send();

  expect(result.status).toBe(StatusCodes.BAD_REQUEST);
  expect(result.body.status).toBe(StatusCodes.BAD_REQUEST);
  expect(result.body.message).toBe('Invalid email address or password!');
});
