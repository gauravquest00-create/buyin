import * as service from './service.js';
import { sendSuccess } from '../../shared/responses/apiResponse.js';

export async function list(_req, res, next) {
  try {
    const data = await service.listRolesAndPermissions();
    return sendSuccess(res, { message: 'Roles and permissions fetched', data });
  } catch (err) { return next(err); }
}

export async function create(req, res, next) {
  try {
    const role = await service.createRole(req.body, req.admin, req.ip);
    return sendSuccess(res, { statusCode: 201, message: 'Role created', data: { role } });
  } catch (err) { return next(err); }
}

export async function update(req, res, next) {
  try {
    const role = await service.updateRole(req.params.roleId, req.body, req.admin, req.ip);
    return sendSuccess(res, { message: 'Role updated', data: { role } });
  } catch (err) { return next(err); }
}
