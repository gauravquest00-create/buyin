import express from 'express';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import env from './config/environment.js';
import { corsMiddleware } from './config/cors.js';
import { helmetMiddleware, globalApiLimiter } from './config/security.js';
import { buildOpenApiSpec } from './config/swagger.js';
import healthRoutes from './routes/health.routes.js';
import userRoutes from './routes/user.routes.js';
import superadminRoutes from './routes/superadmin.routes.js';
import { webhook as razorpayWebhookHandler } from './user-management/recharge/controller.js';
import { globalErrorHandler, notFoundHandler } from './shared/middleware/error.middleware.js';

export function createApp() {
  const app = express();
  app.set('trust proxy', 1);

  app.use(helmetMiddleware);
  app.use(corsMiddleware);
  app.use(cookieParser());

  // CRITICAL: Razorpay webhook MUST receive raw Buffer body BEFORE global express.json()!
  app.post(
    `${env.API_BASE_PATH}/user/recharge/webhook`,
    express.raw({ type: 'application/json', limit: '1mb' }),
    razorpayWebhookHandler
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(env.API_BASE_PATH, globalApiLimiter);

  // OpenAPI / Swagger Docs
  const openApiSpec = buildOpenApiSpec();
  app.get(`${env.API_BASE_PATH}/docs.json`, (_req, res) => res.json(openApiSpec));
  app.use(`${env.API_BASE_PATH}/docs`, swaggerUi.serve, swaggerUi.setup(openApiSpec));

  // Public Contact Inquiry Endpoint (used by Next.js Brand Website)
  app.post(`${env.API_BASE_PATH}/public/contact`, (req, res) => {
    const { name, email, phone, message } = req.body || {};
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required', code: 'VALIDATION_ERROR' });
    }
    return res.status(201).json({
      success: true,
      message: 'Thank you for contacting BUYIN. Our team will respond shortly.',
      data: { receivedAt: new Date().toISOString(), name, email, phone: phone || '' },
    });
  });

  // Centralized Domain Route Registration
  app.use(`${env.API_BASE_PATH}/health`, healthRoutes);
  app.use(`${env.API_BASE_PATH}/user`, userRoutes);
  app.use(`${env.API_BASE_PATH}/superadmin`, superadminRoutes);

  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
}

export default createApp;
