import * as service from './service.js';
import { sendSuccess } from '../../shared/responses/apiResponse.js';

export async function create(req, res, next) {
  try {
    const idempotencyKey = req.headers['x-idempotency-key'] || undefined;
    const data = await service.claimLead(req.user._id, req.body.leadId, idempotencyKey);
    return sendSuccess(res, { statusCode: 201, message: 'Lead claimed and buyer contact unlocked', data });
  } catch (err) {
    return next(err);
  }
}

export async function extensionPreview(req, res, next) {
  try {
    const data = await service.getExtensionPreview(req.user._id, req.params.claimId);
    return sendSuccess(res, { message: 'Extension preview calculated', data });
  } catch (err) {
    return next(err);
  }
}

export async function extend(req, res, next) {
  try {
    const data = await service.extendClaim(req.user._id, req.params.claimId);
    return sendSuccess(res, { message: 'Ownership extended by 7 days', data });
  } catch (err) {
    return next(err);
  }
}
