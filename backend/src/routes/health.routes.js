import { Router } from 'express';
import mongoose from 'mongoose';
import { sendSuccess } from '../shared/responses/apiResponse.js';

const router = Router();

router.get('/', (_req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  return sendSuccess(res, {
    statusCode: dbReady ? 200 : 503,
    message: dbReady ? 'BUYIN API is healthy' : 'BUYIN API degraded (database disconnected)',
    data: {
      service: 'buyin-backend',
      status: dbReady ? 'ok' : 'degraded',
      database: dbReady ? 'connected' : 'disconnected',
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
