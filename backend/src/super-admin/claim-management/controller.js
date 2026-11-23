import * as service from './service.js';
import { sendSuccess } from '../../shared/responses/apiResponse.js';

export async function list(req, res, next) {
  try {
    const claims = await service.listClaims(req.query);
    return sendSuccess(res, { message: 'Claims fetched', data: { claims } });
  } catch (err) { return next(err); }
}

export async function revoke(req, res, next) {
  try {
    const claim = await service.revokeClaimManually(req.params.claimId, req.body, req.admin, req.ip);
    return sendSuccess(res, { message: 'Claim ownership revoked', data: { claim } });
  } catch (err) { return next(err); }
}
