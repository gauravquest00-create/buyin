import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import env from './environment.js';
import { AppError } from '../shared/errors/AppError.js';

let clientInstance = null;

export function isRazorpayConfigured() {
  return Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);
}

export function getRazorpayClient() {
  if (!isRazorpayConfigured()) {
    throw new AppError(
      'Razorpay credentials are not configured on the server.',
      503,
      'PAYMENT_GATEWAY_NOT_CONFIGURED'
    );
  }
  if (!clientInstance) {
    clientInstance = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    });
  }
  return clientInstance;
}

/**
 * Verifies Razorpay Checkout signature: HMAC-SHA256(orderId + "|" + paymentId, keySecret)
 */
export function verifyRazorpayPaymentSignature({ orderId, paymentId, signature, secret = env.RAZORPAY_KEY_SECRET }) {
  if (!orderId || !paymentId || !signature || !secret) return false;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  const expectedBuf = Buffer.from(expected, 'utf8');
  const receivedBuf = Buffer.from(String(signature), 'utf8');
  if (expectedBuf.length !== receivedBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, receivedBuf);
}

/**
 * Verifies Razorpay Webhook signature against the RAW request body Buffer/string.
 */
export function verifyRazorpayWebhookSignature(rawBody, signature, webhookSecret = env.RAZORPAY_WEBHOOK_SECRET) {
  if (!rawBody || !signature || !webhookSecret) return false;
  const expected = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');
  const expectedBuf = Buffer.from(expected, 'utf8');
  const receivedBuf = Buffer.from(String(signature), 'utf8');
  if (expectedBuf.length !== receivedBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, receivedBuf);
}
