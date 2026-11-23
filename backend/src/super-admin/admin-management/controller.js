import * as service from './service.js';
import { sendSuccess } from '../../shared/responses/apiResponse.js';

export async function list(_req, res, next) {
  try {
    const admins = await service.listAdmins();
    return sendSuccess(res, { message: 'Administrators fetched', data: { admins } });
  } catch (err) { return next(err); }
}

export async function create(req, res, next) {
  try {
    const admin = await service.createAdmin(req.body, req.admin, req.ip);
    return sendSuccess(res, { statusCode: 201, message: 'Administrator created', data: { admin } });
  } catch (err) { return next(err); }
}

export async function update(req, res, next) {
  try {
    const admin = await service.updateAdmin(req.params.adminId, req.body, req.admin, req.ip);
    return sendSuccess(res, { message: 'Administrator updated', data: { admin } });
  } catch (err) { return next(err); }
}
