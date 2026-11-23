import env from './config/environment.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { runBootstrap } from './shared/database/bootstrap.js';
import { startBackgroundJobs } from './jobs/index.js';
import { createApp } from './app.js';
import { logger } from './shared/utils/logger.js';

async function startServer() {
  await connectDatabase();
  await runBootstrap();
  const jobRunner = await startBackgroundJobs();

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info('BUYIN Backend API started', {
      port: env.PORT,
      env: env.NODE_ENV,
      apiBasePath: env.API_BASE_PATH,
      docsUrl: `http://localhost:${env.PORT}${env.API_BASE_PATH}/docs`,
    });
  });

  const shutdown = async (signal) => {
    logger.info(`Received ${signal}; shutting down gracefully`);
    if (jobRunner?.worker) await jobRunner.worker.close();
    if (jobRunner?.stop) jobRunner.stop();
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer().catch((err) => {
  logger.error('Fatal startup error', { message: err.message });
  process.exit(1);
});
