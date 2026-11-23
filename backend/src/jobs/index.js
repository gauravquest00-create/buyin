import { Queue, Worker } from 'bullmq';
import env from '../config/environment.js';
import { getRedisConnection } from '../config/redis.js';
import { runClaimExpiryJob } from './claim-expiry.job.js';
import { runLeadReturnJob } from './lead-return.job.js';
import { runFollowUpReminderJob } from './follow-up-reminder.job.js';
import { runPaymentReconciliationJob } from './payment-reconciliation.job.js';
import { logger } from '../shared/utils/logger.js';

const QUEUE_NAME = 'buyin-background-jobs';

export async function startBackgroundJobs() {
  if (!env.enableBackgroundJobs) {
    logger.info('Background jobs disabled via ENABLE_BACKGROUND_JOBS=false');
    return null;
  }

  const connection = getRedisConnection();
  if (connection) {
    const queue = new Queue(QUEUE_NAME, {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 100,
        removeOnFail: 200,
      },
    });

    await queue.add('claim-expiry', {}, { repeat: { every: 15 * 60 * 1000 }, jobId: 'repeat:claim-expiry' });
    await queue.add('lead-return', {}, { repeat: { every: 30 * 60 * 1000 }, jobId: 'repeat:lead-return' });
    await queue.add('follow-up-reminder', {}, { repeat: { every: 10 * 60 * 1000 }, jobId: 'repeat:follow-up-reminder' });
    await queue.add('payment-reconciliation', {}, { repeat: { every: 15 * 60 * 1000 }, jobId: 'repeat:payment-reconciliation' });

    const worker = new Worker(
      QUEUE_NAME,
      async (job) => {
        if (job.name === 'claim-expiry') return runClaimExpiryJob();
        if (job.name === 'lead-return') return runLeadReturnJob();
        if (job.name === 'follow-up-reminder') return runFollowUpReminderJob();
        if (job.name === 'payment-reconciliation') return runPaymentReconciliationJob();
        return null;
      },
      { connection }
    );

    worker.on('failed', (job, err) => {
      logger.error('BullMQ job failed', { jobName: job?.name, message: err.message });
    });

    logger.info('BullMQ background worker started with Redis');
    return { queue, worker };
  }

  // Fallback periodic scheduler when REDIS_URL is not configured in local dev
  logger.warn('REDIS_URL not configured; running in-process periodic job scheduler');
  const timers = [
    setInterval(() => runClaimExpiryJob().catch((e) => logger.error('claim-expiry error', { message: e.message })), 15 * 60 * 1000),
    setInterval(() => runLeadReturnJob().catch((e) => logger.error('lead-return error', { message: e.message })), 30 * 60 * 1000),
    setInterval(() => runFollowUpReminderJob().catch((e) => logger.error('follow-up-reminder error', { message: e.message })), 10 * 60 * 1000),
    setInterval(() => runPaymentReconciliationJob().catch((e) => logger.error('payment-reconciliation error', { message: e.message })), 15 * 60 * 1000),
  ];
  return { stop: () => timers.forEach(clearInterval) };
}
