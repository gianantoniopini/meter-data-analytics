import express from 'express';
export const router = express.Router();
import {
  getMeasurementsFromExternalApi,
  importMeasurements,
  getMeasurements,
  getInstantaneousPowerMeasurements
} from '../controllers/measurement-controller';
import { getSmartMeters } from '../controllers/smart-meter-controller';

router.get('/meterdata/measurement/external', getMeasurementsFromExternalApi);
router.post('/meterdata/measurement/import', importMeasurements);
router.get('/meterdata/measurement', getMeasurements);
router.get(
  '/meterdata/measurement/instantaneouspower',
  getInstantaneousPowerMeasurements
);

router.get('/meterdata/smartmeter', getSmartMeters);
