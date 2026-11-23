import * as service from './service.js';
import { sendSuccess } from '../../shared/responses/apiResponse.js';

export async function overview(_req, res, next) {
  try {
    const data = await service.getPoolOverview();
    return sendSuccess(res, { message: 'Lead pool metrics fetched', data });
  } catch (err) { return next(err); }
}

export async function toggleReturnedDiscount(req, res, next) {
  try {
    const lead = await service.approveReturnedDiscount(req.params.leadId, req.body.approved, req.admin, req.ip);
    return sendSuccess(res, { message: 'Returned lead discount approval updated', data: { lead } });
  } catch (err) { return next(err); }
}
