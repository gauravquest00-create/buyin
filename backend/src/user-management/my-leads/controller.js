import * as service from './service.js';
import { sendSuccess } from '../../shared/responses/apiResponse.js';

export async function list(req, res, next) {
  try {
    const items = await service.listMyLeads(req.user._id, req.query);
    return sendSuccess(res, { message: 'My leads fetched', data: { items } });
  } catch (err) {
    return next(err);
  }
}

export async function detail(req, res, next) {
  try {
    const data = await service.getMyLeadDetail(req.user._id, req.params.claimId);
    return sendSuccess(res, { message: 'Claimed lead details fetched', data });
  } catch (err) {
    return next(err);
  }
}

export async function updateStatus(req, res, next) {
  try {
    const data = await service.updateLeadStatus(req.user._id, req.params.claimId, req.body);
    return sendSuccess(res, { message: 'Lead status updated', data });
  } catch (err) {
    return next(err);
  }
}

export async function addFollowUp(req, res, next) {
  try {
    const followUp = await service.addFollowUp(req.user._id, req.params.claimId, req.body);
    return sendSuccess(res, { statusCode: 201, message: 'Follow-up recorded', data: { followUp } });
  } catch (err) {
    return next(err);
  }
}

export async function scheduleVisit(req, res, next) {
  try {
    const siteVisit = await service.scheduleSiteVisit(req.user._id, req.params.claimId, req.body);
    return sendSuccess(res, { statusCode: 201, message: 'Site visit scheduled', data: { siteVisit } });
  } catch (err) {
    return next(err);
  }
}

export async function updateVisit(req, res, next) {
  try {
    const siteVisit = await service.updateSiteVisit(req.user._id, req.params.visitId, req.body);
    return sendSuccess(res, { message: 'Site visit updated', data: { siteVisit } });
  } catch (err) {
    return next(err);
  }
}
