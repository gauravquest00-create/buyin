import * as service from './service.js';
import { sendSuccess } from '../../shared/responses/apiResponse.js';

export async function list(_req, res, next) {
  try {
    const wallets = await service.listWallets();
    return sendSuccess(res, { message: 'Wallets fetched', data: { wallets } });
  } catch (err) { return next(err); }
}

export async function ledger(req, res, next) {
  try {
    const transactions = await service.listLedger(req.query);
    return sendSuccess(res, { message: 'Wallet ledger fetched', data: { transactions } });
  } catch (err) { return next(err); }
}

export async function adjust(req, res, next) {
  try {
    const data = await service.adjustWallet(req.body, req.admin, req.ip);
    return sendSuccess(res, { message: 'Wallet adjusted via immutable ledger', data });
  } catch (err) { return next(err); }
}
