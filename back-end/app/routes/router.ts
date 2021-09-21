import express from 'express';
export const router = express.Router();
import {
  getMeasurementsFromExternalApi,
  importMeasurements,
  getMeasurements
} from '../controllers/measurementController';

router.get('/api/measurements/external', getMeasurementsFromExternalApi);
router.post('/api/measurements/import', importMeasurements);
router.get('/api/measurements', getMeasurements);
