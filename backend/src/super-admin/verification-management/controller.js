import * as service from './service.js';
import { sendSuccess } from '../../shared/responses/apiResponse.js';

export async function list(req, res, next) {
  try {
    const records = await service.listVerifications(req.query);
    return sendSuccess(res, { message: 'Verification queue fetched', data: { records } });
  } catch (err) { return next(err); }
}

export async function review(req, res, next) {
  try {
    const record = await service.reviewVerification(req.params.recordId, req.body, req.admin, req.ip);
    return sendSuccess(res, { message: 'Verification updated', data: { record } });
  } catch (err) { return next(err); }
}
