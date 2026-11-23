import * as service from './service.js';
import { sendSuccess } from '../../shared/responses/apiResponse.js';

export async function list(req, res, next) {
  try {
    const { leads, meta } = await service.listLeads(req.query);
    return sendSuccess(res, { message: 'Leads fetched', data: { leads }, meta });
  } catch (err) {
    return next(err);
  }
}

export async function detail(req, res, next) {
  try {
    const data = await service.getLeadDetail(req.params.leadId);
    return sendSuccess(res, { message: 'Lead details fetched', data });
  } catch (err) {
    return next(err);
  }
}

export async function create(req, res, next) {
  try {
    const lead = await service.createLead(req.body, req.admin, req.ip);
    return sendSuccess(res, { statusCode: 201, message: 'Lead created', data: { lead } });
  } catch (err) {
    return next(err);
  }
}

export async function update(req, res, next) {
  try {
    const lead = await service.updateLead(req.params.leadId, req.body, req.admin, req.ip);
    return sendSuccess(res, { message: 'Lead updated', data: { lead } });
  } catch (err) {
    return next(err);
  }
}

export async function publish(req, res, next) {
  try {
    const lead = await service.publishLead(req.params.leadId, req.admin, req.ip);
    return sendSuccess(res, { message: 'Lead published to shared pool', data: { lead } });
  } catch (err) {
    return next(err);
  }
}

export async function archive(req, res, next) {
  try {
    const lead = await service.archiveLead(req.params.leadId, req.body?.reason, req.admin, req.ip);
    return sendSuccess(res, { message: 'Lead archived', data: { lead } });
  } catch (err) {
    return next(err);
  }
}