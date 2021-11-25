import express from 'express';
export const router = express.Router();
import { validateAccessToken } from '../middleware/auth';
import { authenticate } from '../controllers/authenticationController';
import { getMeasurements } from '../controllers/meterDataController';

router.post('/authentication/auth', authenticate);
router.get('/meterdata/measurement', validateAccessToken, getMeasurements);
