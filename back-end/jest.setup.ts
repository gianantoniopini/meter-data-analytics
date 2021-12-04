// Setup required environment variables
process.env.BASE_PATH = '/api/v1';
process.env.MONGO_URI = process.env.MONGO_URL; // process.env.MONGO_URL is set by @shelf/jest-mongodb
