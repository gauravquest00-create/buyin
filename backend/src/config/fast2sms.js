import crypto from 'node:crypto';
import env from './environment.js';
import { logger } from '../shared/utils/logger.js';

export const OTP_CONFIG = Object.freeze({
  LENGTH: 6,
  EXPIRY_MINUTES: 5,
  MAX_ATTEMPTS: 5,
  RESEND_COOLDOWN_SECONDS: 60,
  MAX_RESENDS_PER_HOUR: 5,
});

export function generateNumericOtp(length = OTP_CONFIG.LENGTH) {
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;
  return String(crypto.randomInt(min, max + 1));
}

export function hashOtp(otp, identifier, secret = env.USER_SESSION_SECRET) {
  return crypto
    .createHmac('sha256', secret)
    .update(`${identifier}:${otp}`)
    .digest('hex');
}

export function verifyOtpHash(otp, identifier, storedHash, secret = env.USER_SESSION_SECRET) {
  if (!otp || !identifier || !storedHash) return false;
  const computed = hashOtp(otp, identifier, secret);
  const a = Buffer.from(computed, 'utf8');
  const b = Buffer.from(storedHash, 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/**
 * Sends OTP via Fast2SMS REST API. Never logs the OTP value.
 * Uses Quick SMS ('q') by default; set FAST2SMS_ROUTE=otp in .env after website verification.
 */
export async function sendOtpSms(mobile, otp) {
  const sanitizedMobile = String(mobile).replace(/\D/g, '').slice(-10);
  if (sanitizedMobile.length !== 10) {
    return { delivered: false, provider: 'fast2sms', error: 'Invalid 10-digit Indian mobile number' };
  }

  if (!env.FAST2SMS_API_KEY) {
    logger.warn('Fast2SMS API key not configured; OTP SMS delivery skipped', {
      mobileSuffix: sanitizedMobile.slice(-4),
    });
    return {
      delivered: false,
      provider: 'fast2sms',
      status: 'UNCONFIGURED',
      error: 'FAST2SMS_API_KEY is not configured',
    };
  }

  const route = process.env.FAST2SMS_ROUTE === 'otp' ? 'otp' : 'q';
  const payload =
    route === 'otp'
      ? {
          route: 'otp',
          variables_values: otp,
          numbers: sanitizedMobile,
        }
      : {
          route: 'q',
          message: `Your BUYIN verification OTP is ${otp}. Valid for 5 minutes.`,
          language: 'english',
          numbers: sanitizedMobile,
        };

  try {
    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        authorization: env.FAST2SMS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok || data.return === false) {
      logger.error('Fast2SMS delivery failed', {
        status: response.status,
        statusCode: data?.status_code,
        providerMessage: data?.message,
        route,
        mobileSuffix: sanitizedMobile.slice(-4),
      });
      return {
        delivered: false,
        provider: 'fast2sms',
        status: 'FAILED',
        providerRequestId: data?.request_id || null,
        error: data?.message || 'Fast2SMS request failed',
      };
    }

    return {
      delivered: true,
      provider: 'fast2sms',
      status: 'DELIVERED',
      providerRequestId: data?.request_id || null,
    };
  } catch (error) {
    logger.error('Fast2SMS network error', { message: error.message });
    return {
      delivered: false,
      provider: 'fast2sms',
      status: 'NETWORK_ERROR',
      error: error.message,
    };
  }
}