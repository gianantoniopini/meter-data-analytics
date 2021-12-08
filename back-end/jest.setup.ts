// Setup required environment variables
process.env.BASE_PATH = '/api/v1';
process.env.EXTERNAL_API_AUTH_URL =
  'http://localhost:8083/api/v1/authentication/auth';
process.env.EXTERNAL_API_AUTH_EMAIL = 'noemail@noemail.com';
process.env.EXTERNAL_API_AUTH_PWD = 'password';
process.env.EXTERNAL_API_COOKIE_DOMAIN_URL = 'http://localhost:8083';
process.env.EXTERNAL_API_MEASUREMENT_URL =
  'http://localhost:8083/api/v1/meterdata/measurement';
