import * as service from './service.js';
import { sendSuccess } from '../../shared/responses/apiResponse.js';

export async function list(req, res, next) {
  try {
    const refunds = await service.listRefunds(req.query);
    return sendSuccess(res, { message: 'Refund requests fetched', data: { refunds } });
  } catch (err) { return next(err); }
}

export async function approve(req, res, next) {
  try {
    const data = await service.approveRefundAtomically({
      refundId: req.params.refundId,
      admin: req.admin,
      leadOutcome: req.body.leadOutcome,
      adminRemarks: req.body.adminRemarks,
      ipAddress: req.ip,
    });
    return sendSuccess(res, { message: 'Refund approved and 95% points credited', data });
  } catch (err) { return next(err); }
}

export async function reject(req, res, next) {
  try {
    const refund = await service.rejectRefundAtomically({
      refundId: req.params.refundId,
      admin: req.admin,
      adminRemarks: req.body.adminRemarks,
      ipAddress: req.ip,
    });
    return sendSuccess(res, { message: 'Refund rejected', data: { refund } });
  } catch (err) { return next(err); }
}

export async function requestInfo(req, res, next) {
  try {
    const refund = await service.requestAdditionalInfo(req.params.refundId, req.body.adminRemarks, req.admin);
    return sendSuccess(res, { message: 'Additional information requested', data: { refund } });
  } catch (err) { return next(err); }
}
