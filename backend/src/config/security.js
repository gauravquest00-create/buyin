import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import env from './environment.js';

export const helmetMiddleware = helmet({
  contentSecurityPolicy: env.isProduction ? undefined : false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
});

export const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please wait 15 minutes.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
  },
});

export const otpRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'OTP request limit reached. Please wait before requesting another code.',
    code: 'OTP_RATE_LIMIT_EXCEEDED',
  },
});

export const COOKIE_NAMES = Object.freeze({
  USER_TOKEN: 'buyin_user_session',
  USER_CSRF: 'buyin_user_csrf',
  ADMIN_TOKEN: 'buyin_admin_session',
  ADMIN_CSRF: 'buyin_admin_csrf',
});

export function buildCookieOptions(maxAgeMs, httpOnly = true) {
  return {
    httpOnly,
    secure: env.cookieSecure,
    sameSite: env.cookieSecure ? 'none' : 'lax',
    domain: env.COOKIE_DOMAIN || undefined,
    path: '/',
    maxAge: maxAgeMs,
  };
}
