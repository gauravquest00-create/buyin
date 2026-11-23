import * as service from './service.js';
import { sendSuccess } from '../../shared/responses/apiResponse.js';

export async function dashboardSummary(req, res, next) {
  try {
    const data = await service.getDashboardSummary(req.user);
    return sendSuccess(res, { message: 'Dashboard summary fetched', data });
  } catch (err) {
    return next(err);
  }
}

export async function list(req, res, next) {
  try {
    const { items, walletBalancePoints, claimEligibility, meta } = await service.browseLeadPool(req.user, req.query);
    return sendSuccess(res, {
      message: 'Lead pool fetched',
      data: { leads: items, walletBalancePoints, claimEligibility },
      meta,
    });
  } catch (err) {
    return next(err);
  }
}

export async function detail(req, res, next) {
  try {
    const data = await service.getPoolLeadDetail(req.user, req.params.leadId);
    return sendSuccess(res, { message: 'Lead details fetched', data });
  } catch (err) {
    return next(err);
  }
}
