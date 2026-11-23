import * as service from './service.js';
import { sendSuccess } from '../../shared/responses/apiResponse.js';

export async function get(_req, res, next) {
  try {
    const data = await service.getActivePricing();
    return sendSuccess(res, { message: 'Pricing configuration fetched', data });
  } catch (err) { return next(err); }
}

export async function update(req, res, next) {
  try {
    const rule = await service.updatePricingRules(req.body, req.admin, req.ip);
    return sendSuccess(res, { message: 'Pricing rules updated (historical claims preserved)', data: { rule } });
  } catch (err) { return next(err); }
}
