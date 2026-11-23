import * as service from './service.js';
import { sendSuccess } from '../../shared/responses/apiResponse.js';

export async function preview(req, res, next) {
  try {
    const data = await service.previewRefund(req.user._id, req.params.claimId);
    return sendSuccess(res, { message: 'Refund breakdown calculated', data });
  } catch (err) {
    return next(err);
  }
}

export async function create(req, res, next) {
  try {
    const refund = await service.createRefund(req.user._id, req.body, req.files || []);
    return sendSuccess(res, { statusCode: 201, message: 'Refund request submitted', data: { refund } });
  } catch (err) {
    return next(err);
  }
}

export async function list(req, res, next) {
  try {
    const refunds = await service.listMyRefunds(req.user._id);
    return sendSuccess(res, { message: 'Refund requests fetched', data: { refunds } });
  } catch (err) {
    return next(err);
  }
}

export async function respondInfo(req, res, next) {
  try {
    const refund = await service.respondAdditionalInfo(req.user._id, req.params.refundId, req.body.additionalInfo);
    return sendSuccess(res, { message: 'Additional information submitted', data: { refund } });
  } catch (err) {
    return next(err);
  }
}
