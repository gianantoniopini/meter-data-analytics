import got from 'got';
import toughCookie, { CookieJar } from 'tough-cookie';
import { promisify } from 'util';

type Measurement = {
  measurement: string;
  timestamp: Date;
  tags: { muid: string };
  '0100010700FF': number;
  '0100020700FF': number;
  '0100100700FF': number;
};

type MeasurementResponse = {
  data: [Measurement];
};

async function getAuthenticationCookie(
  authUrl: string,
  authEmail: string,
  authPassword: string
): Promise<{
  cookie: toughCookie.Cookie | undefined;
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

  const cookie = toughCookie.parse(authResponseHeaders['set-cookie'][0]);
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
  cookie: toughCookie.Cookie,
  cookieDomainUrl: string,
  measurementUrl: string,
  muid: string,
  start: string,
  stop: string,
  limit: number
): Promise<[Measurement]> {
  const cookieJar = new CookieJar();
  const setCookie = promisify(cookieJar.setCookie.bind(cookieJar));
  await setCookie(cookie, cookieDomainUrl);

  const { body: responseBody } = await got<MeasurementResponse>(
    `${measurementUrl}?muid=${muid}&start=${start}&stop=${stop}&limit=${limit}`,
    {
      cookieJar,
      responseType: 'json'
    }
  );

  return responseBody.data;
}

async function authenticateAndGetMeasurement(
  muid: string,
  start: string,
  stop: string,
  limit: number
): Promise<{
  measurements: [Measurement] | undefined;
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
    cookie as toughCookie.Cookie,
    process.env.EXTERNAL_API_COOKIE_DOMAIN_URL as string,
    process.env.EXTERNAL_API_MEASUREMENT_URL as string,
    muid,
    start,
    stop,
    limit
  );
  return { measurements, error: undefined };
}

export { authenticateAndGetMeasurement, Measurement };
