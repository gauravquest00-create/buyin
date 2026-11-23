import { withTransaction } from '../../config/database.js';
import { getRazorpayClient, verifyRazorpayPaymentSignature, verifyRazorpayWebhookSignature } from '../../config/razorpay.js';
import env from '../../config/environment.js';
import { Payment } from '../../shared/models/Payment.model.js';
import { PaymentEvent } from '../../shared/models/PaymentEvent.model.js';
import { RechargePackage } from '../../shared/models/RechargePackage.model.js';
import { Notification } from '../../shared/models/Notification.model.js';
import { PaymentStatus, WalletTxType } from '../../shared/enums/index.js';
import { calculateCustomRecharge, creditWalletPoints, ensureWallet } from '../wallet/wallet.logic.js';
import { AppError, NotFoundError, ValidationError } from '../../shared/errors/AppError.js';
import { generateCode } from '../../shared/utils/crypto.js';

export async function createRechargeOrder({ userId, packageCode, customAmountInr }) {
  let amountInr;
  let amountPaise;
  let basePoints;
  let bonusPoints = 0;
  let totalPoints;
  let packageId = null;
  let isCustomRecharge = false;

  if (packageCode) {
    const pkg = await RechargePackage.findOne({ code: packageCode, isActive: true }).lean();
    if (!pkg) throw new NotFoundError('Recharge package not found', 'PACKAGE_NOT_FOUND');
    packageId = pkg._id;
    amountInr = pkg.amountInr;
    amountPaise = Math.round(pkg.amountInr * 100);
    basePoints = pkg.basePoints;
    bonusPoints = pkg.bonusPoints;
    totalPoints = pkg.totalPoints;
  } else {
    isCustomRecharge = true;
    const calc = calculateCustomRecharge(customAmountInr);
    amountInr = calc.amountInr;
    amountPaise = calc.amountPaise;
    basePoints = calc.basePoints;
    bonusPoints = calc.bonusPoints;
    totalPoints = calc.totalPoints;
  }

  const internalTransactionId = generateCode('PAY');
  const razorpay = getRazorpayClient();

  const order = await razorpay.orders.create({
    amount: amountPaise,
    currency: 'INR',
    receipt: internalTransactionId,
    notes: {
      userId: String(userId),
      internalTransactionId,
      basePoints: String(basePoints),
      bonusPoints: String(bonusPoints),
    },
  });

  const payment = await Payment.create({
    internalTransactionId,
    userId,
    packageId,
    isCustomRecharge,
    amountInr,
    amountPaise,
    basePoints,
    bonusPoints,
    totalPoints,
    razorpayOrderId: order.id,
    status: PaymentStatus.PENDING,
  });

  const wallet = await ensureWallet(userId);

  return {
    payment,
    checkout: {
      razorpayKeyId: env.RAZORPAY_KEY_ID,
      razorpayOrderId: order.id,
      amountPaise,
      currency: 'INR',
      internalTransactionId,
    },
    summary: {
      amountInr,
      basePoints,
      bonusPoints,
      totalPoints,
      currentBalance: wallet.balancePoints,
      expectedBalanceAfter: wallet.balancePoints + totalPoints,
    },
  };
}

/**
 * Idempotently credits wallet for a verified payment exactly once.
 */
export async function settleVerifiedPayment({ razorpayOrderId, razorpayPaymentId, viaWebhook = false }) {
  return withTransaction(async (session) => {
    const payment = await Payment.findOne({ razorpayOrderId }).session(session);
    if (!payment) throw new NotFoundError('Payment order not found', 'PAYMENT_NOT_FOUND');

    if (payment.walletCredited) {
      return { payment, alreadyCredited: true };
    }

    const updated = await Payment.findOneAndUpdate(
      { _id: payment._id, walletCredited: false },
      {
        $set: {
          razorpayPaymentId: razorpayPaymentId || payment.razorpayPaymentId,
          status: PaymentStatus.CAPTURED,
          walletCredited: true,
          razorpaySignatureVerified: payment.razorpaySignatureVerified || !viaWebhook,
          webhookVerified: payment.webhookVerified || viaWebhook,
          reconciledAt: new Date(),
        },
      },
      { new: true, session }
    );

    if (!updated) {
      const fresh = await Payment.findById(payment._id).session(session);
      return { payment: fresh, alreadyCredited: true };
    }

    const baseResult = await creditWalletPoints({
      userId: updated.userId,
      points: updated.basePoints,
      type: WalletTxType.RECHARGE,
      reason: `Wallet recharge ₹${updated.amountInr} (${updated.internalTransactionId})`,
      idempotencyKey: `payment-base:${updated.razorpayOrderId}`,
      referenceType: 'PAYMENT',
      referenceId: updated._id,
      metadata: { razorpayOrderId, razorpayPaymentId },
      session,
    });

    updated.walletTransactionId = baseResult.transaction._id;

    if (updated.bonusPoints > 0) {
      const bonusResult = await creditWalletPoints({
        userId: updated.userId,
        points: updated.bonusPoints,
        type: WalletTxType.BONUS_CREDIT,
        reason: `Recharge package bonus points (${updated.internalTransactionId})`,
        idempotencyKey: `payment-bonus:${updated.razorpayOrderId}`,
        referenceType: 'BONUS',
        referenceId: updated._id,
        metadata: { razorpayOrderId },
        session,
      });
      updated.bonusTransactionId = bonusResult.transaction._id;
    }

    await updated.save({ session });

    await Notification.create(
      [
        {
          recipientType: 'USER',
          recipientId: updated.userId,
          title: 'Wallet Recharged Successfully',
          message: `₹${updated.amountInr} received. ${updated.totalPoints} claim points credited to your BUYIN wallet.`,
          type: 'WALLET',
          metadata: { paymentId: updated._id, totalPoints: updated.totalPoints },
        },
      ],
      { session }
    );

    return { payment: updated, alreadyCredited: false };
  });
}

export async function verifyClientCheckoutPayment({ userId, razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  const payment = await Payment.findOne({ razorpayOrderId, userId });
  if (!payment) throw new NotFoundError('Payment order not found', 'PAYMENT_NOT_FOUND');

  const isValid = verifyRazorpayPaymentSignature({
    orderId: razorpayOrderId,
    paymentId: razorpayPaymentId,
    signature: razorpaySignature,
  });

  if (!isValid) {
    payment.status = PaymentStatus.FAILED;
    payment.failureReason = 'Invalid Razorpay payment signature';
    await payment.save();
    throw new AppError('Payment signature verification failed', 400, 'INVALID_PAYMENT_SIGNATURE');
  }

  return settleVerifiedPayment({ razorpayOrderId, razorpayPaymentId, viaWebhook: false });
}

export async function handleRazorpayWebhook({ rawBody, signature, eventIdHeader }) {
  const signatureVerified = verifyRazorpayWebhookSignature(rawBody, signature);
  const parsed = JSON.parse(rawBody.toString('utf8'));
  const eventType = parsed.event || 'unknown';
  const paymentEntity = parsed?.payload?.payment?.entity || {};
  const razorpayOrderId = paymentEntity.order_id || parsed?.payload?.order?.entity?.id || null;
  const razorpayPaymentId = paymentEntity.id || null;
  const eventId = eventIdHeader || `${eventType}:${razorpayOrderId}:${razorpayPaymentId || Date.now()}`;

  const existing = await PaymentEvent.findOne({ eventId });
  if (existing && existing.processed) {
    return { duplicate: true, eventId, eventType };
  }

  if (!existing) {
    await PaymentEvent.create({
      eventId,
      eventType,
      razorpayOrderId,
      razorpayPaymentId,
      signatureVerified,
      processed: false,
      payload: parsed,
    });
  }

  if (!signatureVerified) {
    throw new AppError('Invalid Razorpay webhook signature', 401, 'INVALID_WEBHOOK_SIGNATURE');
  }

  if ((eventType === 'payment.captured' || eventType === 'order.paid') && razorpayOrderId) {
    await settleVerifiedPayment({ razorpayOrderId, razorpayPaymentId, viaWebhook: true });
  } else if (eventType === 'payment.failed' && razorpayOrderId) {
    await Payment.findOneAndUpdate(
      { razorpayOrderId, walletCredited: false },
      {
        $set: {
          status: PaymentStatus.FAILED,
          razorpayPaymentId,
          failureReason: paymentEntity.error_description || 'Payment failed at gateway',
        },
      }
    );
  }

  await PaymentEvent.findOneAndUpdate({ eventId }, { $set: { processed: true } });
  return { duplicate: false, eventId, eventType };
}
