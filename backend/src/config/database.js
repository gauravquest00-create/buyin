import mongoose from 'mongoose';
import env from './environment.js';
import { logger } from '../shared/utils/logger.js';

mongoose.set('strictQuery', true);

export async function connectDatabase() {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      maxPoolSize: 20,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    logger.info('MongoDB connected successfully', { dbName: mongoose.connection.name });
  } catch (error) {
    logger.error('MongoDB connection failed', { message: error.message });
    throw error;
  }
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
}

/**
 * Executes a callback inside a MongoDB multi-document transaction when supported
 * (Atlas / replica sets), with graceful single-node fallback only in non-production
 * standalone development setups.
 */
export async function withTransaction(fn) {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await fn(session);
    });
    return result;
  } catch (err) {
    if (
      !env.isProduction &&
      (err?.codeName === 'IllegalOperation' ||
        /Transaction numbers are only allowed on a replica set/i.test(err?.message || ''))
    ) {
      logger.warn('Standalone MongoDB detected in non-production; executing without multi-doc transaction session');
      return fn(null);
    }
    throw err;
  } finally {
    await session.endSession();
  }
}
