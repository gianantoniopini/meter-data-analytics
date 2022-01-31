import express from 'express';
export const router = express.Router();
import {
  getMeasurementsFromExternalApi,
  importMeasurements,
  getMeasurements,
  getInstantaneousPowerMeasurements
} from '../controllers/meter-data-controller';

router.get('/meterdata/measurement/external', getMeasurementsFromExternalApi);
router.post('/meterdata/measurement/import', importMeasurements);
router.get('/meterdata/measurement', getMeasurements);
router.get(
  '/meterdata/measurement/instantaneouspower',
  getInstantaneousPowerMeasurements
);
