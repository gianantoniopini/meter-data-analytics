import express from 'express';
import { validateAccessToken } from '../middleware/auth';
import { authenticate } from '../controllers/authentication-controller';
import { getMeasurements } from '../controllers/meter-data-controller';

export const router = express.Router();

router.post('/authentication/auth', authenticate);
router.get('/meterdata/measurement', validateAccessToken, getMeasurements);
