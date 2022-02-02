import got from 'got';
import { Cookie, CookieJar } from 'tough-cookie';
import { promisify } from 'node:util';
import ExternalApiMeasurement from '@shared/interfaces/external-api-measurement.interface';
import { ExternalApiMeasurementResponse } from '../interfaces/external-api-measurement-response.interface';

async function getAuthenticationCookie(
  authUrl: string,
  authEmail: string,
  authPassword: string
): Promise<{
  cookie: Cookie | undefined;
  error: string | undefined;
}> {
  const { headers: authResponseHeaders } = await got.post(authUrl, {
    json: {
      email: authEmail,
      password: authPassword
    },
    responseType: 'json'
  });

  if (!authResponseHeaders || !authResponseHeaders['set-cookie']) {
    return {
      cookie: undefined,
      error: 'Could not retrieve set-cookie from auth response headers.'
    };
  }

  const cookie = Cookie.parse(authResponseHeaders['set-cookie'][0]);
  if (!cookie) {
    return {
      cookie: undefined,
      error: 'Could not retrieve cookie from auth response headers.'
    };
  }

  return {
    cookie,
    error: undefined
  };
}

async function getMeasurement(
  cookie: Cookie,
  cookieDomainUrl: string,
  measurementUrl: string,
  muid: string,
  start: string | undefined,
  stop: string | undefined,
  limit: number | undefined
): Promise<ExternalApiMeasurement[]> {
  const cookieJar = new CookieJar();
  const setCookie = promisify(cookieJar.setCookie.bind(cookieJar));
  await setCookie(cookie, cookieDomainUrl);

  const { body: responseBody } = await got.get<ExternalApiMeasurementResponse>(
    `${measurementUrl}?muid=${muid}&start=${start ?? ''}&stop=${
      stop ?? ''
    }&limit=${limit ?? ''}`,
    {
      cookieJar,
      responseType: 'json'
    }
  );

  return responseBody.data;
}

async function authenticateAndGetMeasurement(
  muid: string,
  start: string | undefined,
  stop: string | undefined,
  limit: number | undefined
): Promise<{
  measurements: ExternalApiMeasurement[] | undefined;
  error: string | undefined;
}> {
  const { cookie, error: authError } = await getAuthenticationCookie(
    process.env.EXTERNAL_API_AUTH_URL as string,
    process.env.EXTERNAL_API_AUTH_EMAIL as string,
    process.env.EXTERNAL_API_AUTH_PWD as string
  );
  if (authError) {
    return { measurements: undefined, error: authError };
  }

  const measurements = await getMeasurement(
    cookie as Cookie,
    process.env.EXTERNAL_API_COOKIE_DOMAIN_URL as string,
    process.env.EXTERNAL_API_MEASUREMENT_URL as string,
    muid,
    start,
    stop,
    limit
  );
  return { measurements, error: undefined };
}

export { authenticateAndGetMeasurement };
