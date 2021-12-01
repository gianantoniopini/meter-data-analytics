import express from 'express';
import { validateAccessToken } from '../middleware/auth';
import { authenticate } from '../controllers/authenticationController';
import { getMeasurements } from '../controllers/meterDataController';

export const router = express.Router();

router.post('/authentication/auth', authenticate);
router.get('/meterdata/measurement', validateAccessToken, getMeasurements);
