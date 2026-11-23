import crypto from 'node:crypto';
import { BUSINESS_RULES } from '../constants/index.js';
import { ValidationError } from '../errors/AppError.js';

export function calculateRefundBreakdown(originalClaimPoints) {
  const original = Math.round(Number(originalClaimPoints));
  if (!Number.isFinite(original) || original <= 0) {
    throw new ValidationError('Original claim points must be a positive number');
  }
  const refundablePoints = Math.round(original * BUSINESS_RULES.REFUND_CREDIT_RATIO);
  const deductionPoints = original - refundablePoints;
  return {
    originalClaimPoints: original,
    deductionPercent: 5,
    refundPercent: 95,
    deductionPoints,
    refundablePoints,
  };
}

export function calculateExtensionCost(originalClaimPoints) {
  const original = Math.round(Number(originalClaimPoints));
  if (!Number.isFinite(original) || original <= 0) {
    throw new ValidationError('Original claim points must be positive');
  }
  return Math.max(1, Math.round(original * BUSINESS_RULES.EXTENSION_COST_RATIO));
}

export function calculateCustomRecharge(amountInr) {
  const numericAmount = Number(amountInr);
  if (!Number.isFinite(numericAmount) || numericAmount < BUSINESS_RULES.CUSTOM_RECHARGE_MIN_INR) {
    throw new ValidationError(`Minimum custom recharge is ₹${BUSINESS_RULES.CUSTOM_RECHARGE_MIN_INR}`);
  }
  const basePoints = Math.round(numericAmount * BUSINESS_RULES.CUSTOM_RECHARGE_POINTS_PER_INR);
  return {
    amountInr: numericAmount,
    amountPaise: Math.round(numericAmount * 100),
    basePoints,
    bonusPoints: 0,
    totalPoints: basePoints,
  };
}

export function verifyRazorpayPaymentHmac({ orderId, paymentId, signature, secret }) {
  if (!orderId || !paymentId || !signature || !secret) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(String(signature), 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function verifyRazorpayWebhookHmac(rawBody, signature, webhookSecret) {
  if (!rawBody || !signature || !webhookSecret) return false;
  const expected = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(String(signature), 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function hashOtpValue(otp, identifier, secret) {
  return crypto.createHmac('sha256', secret).update(`${identifier}:${otp}`).digest('hex');
}

export function verifyOtpValue(otp, identifier, storedHash, secret) {
  if (!otp || !identifier || !storedHash || !secret) return false;
  const computed = hashOtpValue(otp, identifier, secret);
  const a = Buffer.from(computed, 'utf8');
  const b = Buffer.from(storedHash, 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
