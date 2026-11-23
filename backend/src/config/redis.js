import IORedis from 'ioredis';
import env from './environment.js';
import { logger } from '../shared/utils/logger.js';

let redisClient = null;

export function getRedisConnection() {
  if (!env.REDIS_URL) {
    return null;
  }
  if (!redisClient) {
    redisClient = new IORedis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
    redisClient.on('error', (err) => {
      logger.error('Redis connection error', { message: err.message });
    });
    redisClient.on('connect', () => {
      logger.info('Redis connected');
    });
  }
  return redisClient;
}
