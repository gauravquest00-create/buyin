import { Payment } from '../../shared/models/Payment.model.js';
import { PaymentEvent } from '../../shared/models/PaymentEvent.model.js';
import { runPaymentReconciliationJob } from '../../jobs/payment-reconciliation.job.js';

export async function listPayments(query) {
  const filter = {};
  if (query.status) filter.status = query.status;
  return Payment.find(filter).populate('userId', 'fullName email mobile').sort({ createdAt: -1 }).limit(100).lean();
}

export async function listPaymentEvents() {
  return PaymentEvent.find().sort({ createdAt: -1 }).limit(100).lean();
}

export async function triggerReconciliation() {
  return runPaymentReconciliationJob();
}
