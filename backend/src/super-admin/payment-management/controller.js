import * as service from './service.js';
import { sendSuccess } from '../../shared/responses/apiResponse.js';

export async function list(req, res, next) {
  try {
    const payments = await service.listPayments(req.query);
    return sendSuccess(res, { message: 'Payments fetched', data: { payments } });
  } catch (err) { return next(err); }
}

export async function events(_req, res, next) {
  try {
    const events = await service.listPaymentEvents();
    return sendSuccess(res, { message: 'Webhook events fetched', data: { events } });
  } catch (err) { return next(err); }
}

export async function reconcile(_req, res, next) {
  try {
    const result = await service.triggerReconciliation();
    return sendSuccess(res, { message: 'Payment reconciliation executed', data: result });
  } catch (err) { return next(err); }
}
