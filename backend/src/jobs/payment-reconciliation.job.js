import { Payment } from '../shared/models/Payment.model.js';
import { PaymentStatus } from '../shared/enums/index.js';
import { getRazorpayClient, isRazorpayConfigured } from '../config/razorpay.js';
import { settleVerifiedPayment } from '../logics/payment/payment.logic.js';
import { logger } from '../shared/utils/logger.js';

export async function runPaymentReconciliationJob() {
  if (!isRazorpayConfigured()) {
    return { skipped: true, reason: 'Razorpay not configured' };
  }

  const cutoff = new Date(Date.now() - 10 * 60 * 1000);
  const stalePayments = await Payment.find({
    status: PaymentStatus.PENDING,
    walletCredited: false,
    createdAt: { $lte: cutoff },
  }).limit(50);

  const razorpay = getRazorpayClient();
  let reconciled = 0;

  for (const pay of stalePayments) {
    try {
      const orderPayments = await razorpay.orders.fetchPayments(pay.razorpayOrderId);
      const captured = (orderPayments?.items || []).find((p) => p.status === 'captured');
      if (captured) {
        await settleVerifiedPayment({
          razorpayOrderId: pay.razorpayOrderId,
          razorpayPaymentId: captured.id,
          viaWebhook: true,
        });
        reconciled++;
      } else {
        pay.reconciledAt = new Date();
        await pay.save();
      }
    } catch (err) {
      logger.error('Payment reconciliation failed for order', {
        orderId: pay.razorpayOrderId,
        message: err.message,
      });
    }
  }

  logger.info('Payment reconciliation completed', { checked: stalePayments.length, reconciled });
  return { checked: stalePayments.length, reconciled };
}
