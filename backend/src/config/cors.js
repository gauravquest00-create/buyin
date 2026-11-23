import cors from 'cors';
import env from './environment.js';
import { AppError } from '../shared/errors/AppError.js';

export const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    const normalized = origin.replace(/\/$/, '');
    if (env.allowedOrigins.includes(normalized)) {
      return callback(null, true);
    }
    return callback(new AppError(`CORS origin not allowed: ${origin}`, 403, 'CORS_ORIGIN_DENIED'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Idempotency-Key', 'X-Request-Id'],
  exposedHeaders: ['X-Request-Id'],
  maxAge: 86400,
};

export const corsMiddleware = cors(corsOptions);
