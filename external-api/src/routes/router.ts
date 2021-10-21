import express from 'express';
export const router = express.Router();
import { authenticate } from '../controllers/authenticationController';

router.post('/authentication/auth', authenticate);
