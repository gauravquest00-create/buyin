import * as service from './service.js';
import { sendSuccess } from '../../shared/responses/apiResponse.js';

export async function list(req, res, next) {
  try {
    const { items, meta } = await service.listUserTransactions(req.user._id, req.query);
    return sendSuccess(res, { message: 'Transactions fetched', data: { transactions: items }, meta });
  } catch (err) {
    return next(err);
  }
}
