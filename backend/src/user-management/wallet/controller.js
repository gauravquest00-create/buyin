import * as service from './service.js';
import { sendSuccess } from '../../shared/responses/apiResponse.js';

export async function overview(req, res, next) {
  try {
    const data = await service.getWalletOverview(req.user._id);
    return sendSuccess(res, { message: 'Wallet overview fetched', data });
  } catch (err) {
    return next(err);
  }
}

export async function quote(req, res, next) {
  try {
    const data = await service.getCustomQuote(req.user._id, req.query.amountInr);
    return sendSuccess(res, { message: 'Custom recharge quote calculated', data });
  } catch (err) {
    return next(err);
  }
}
