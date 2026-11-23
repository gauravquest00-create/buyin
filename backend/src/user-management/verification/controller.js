import * as service from './service.js';
import { sendSuccess } from '../../shared/responses/apiResponse.js';

export async function getStatus(req, res, next) {
  try {
    const data = await service.getVerificationStatus(req.user._id);
    return sendSuccess(res, { message: 'Verification status fetched', data });
  } catch (err) {
    return next(err);
  }
}

export async function submit(req, res, next) {
  try {
    const record = await service.submitVerification(req.user, req.body, req.files || []);
    return sendSuccess(res, { statusCode: 201, message: 'Verification submitted for review', data: { record } });
  } catch (err) {
    return next(err);
  }
}
