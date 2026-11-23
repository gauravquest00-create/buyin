import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const isProd = process.env.NODE_ENV === 'production';

const envSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_BASE_PATH: z.string().default('/api/v1'),
  MONGODB_URI: isProd
    ? z.string().min(10, 'MONGODB_URI is required in production')
    : z.string().default('mongodb://127.0.0.1:27017/buyin'),
  JWT_SECRET: isProd
    ? z.string().min(32, 'JWT_SECRET must be at least 32 characters in production')
    : z.string().min(16).default('dev-user-jwt-secret-change-in-prod-001'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  ADMIN_JWT_SECRET: isProd
    ? z.string().min(32, 'ADMIN_JWT_SECRET must be at least 32 characters in production')
    : z.string().min(16).default('dev-admin-jwt-secret-change-in-prod-002'),
  ADMIN_JWT_EXPIRES_IN: z.string().default('8h'),
  USER_SESSION_SECRET: isProd
    ? z.string().min(32, 'USER_SESSION_SECRET required in production')
    : z.string().min(16).default('dev-user-session-secret-change-me-003'),
  ADMIN_SESSION_SECRET: isProd
    ? z.string().min(32, 'ADMIN_SESSION_SECRET required in production')
    : z.string().min(16).default('dev-admin-session-secret-change-me-004'),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(10).optional(),
  CLOUDINARY_CLOUD_NAME: z.string().default(''),
  CLOUDINARY_API_KEY: z.string().default(''),
  CLOUDINARY_API_SECRET: z.string().default(''),
  CLIENT_URL: z.string().url().default('http://localhost:3000'),
  DASHBOARD_URL: z.string().url().default('http://localhost:3001'),
  SUPERADMIN_URL: z.string().url().default('http://localhost:3002'),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  RAZORPAY_KEY_ID: z.string().default(''),
  RAZORPAY_KEY_SECRET: z.string().default(''),
  RAZORPAY_WEBHOOK_SECRET: z.string().default(''),
  FAST2SMS_API_KEY: z.string().default(''),
  FAST2SMS_SENDER_ID: z.string().default('BUYINN'),
  REDIS_URL: z.string().default(''),
  COOKIE_DOMAIN: z.string().default(''),
  COOKIE_SECURE: z.string().optional(),
  ENABLE_BACKGROUND_JOBS: z.string().default('true'),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('Environment validation failed:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const data = parsed.data;

if (data.JWT_SECRET === data.ADMIN_JWT_SECRET) {
  console.error('SECURITY VIOLATION: JWT_SECRET and ADMIN_JWT_SECRET must be distinct.');
  process.exit(1);
}

const allowedOrigins = Array.from(
  new Set(
    [data.CLIENT_URL, data.DASHBOARD_URL, data.SUPERADMIN_URL, data.FRONTEND_URL]
      .filter(Boolean)
      .map((u) => u.replace(/\/$/, ''))
  )
);

export const env = Object.freeze({
  ...data,
  isProduction: data.NODE_ENV === 'production',
  isDevelopment: data.NODE_ENV === 'development',
  isTest: data.NODE_ENV === 'test',
  cookieSecure: data.COOKIE_SECURE ? data.COOKIE_SECURE === 'true' : data.NODE_ENV === 'production',
  enableBackgroundJobs: data.ENABLE_BACKGROUND_JOBS !== 'false',
  allowedOrigins,
});

export default env;
