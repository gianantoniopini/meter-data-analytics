import express from 'express';
export const router = express.Router();
import {
  authenticate,
  validateAccessToken
} from '../controllers/authenticationController';
import { getMeasurements } from '../controllers/meterDataController';

router.post('/authentication/auth', authenticate);
router.get('/meterdata/measurement', validateAccessToken, getMeasurements);
