import * as service from './service.js';
import { sendSuccess } from '../../shared/responses/apiResponse.js';

export async function list(req, res, next) {
  try {
    const { users, meta } = await service.listUsers(req.query);
    return sendSuccess(res, { message: 'Users fetched', data: { users }, meta });
  } catch (err) {
    return next(err);
  }
}

export async function detail(req, res, next) {
  try {
    const data = await service.getUserDetail(req.params.userId);
    return sendSuccess(res, { message: 'User details fetched', data });
  } catch (err) {
    return next(err);
  }
}

export async function updateStatus(req, res, next) {
  try {
    const user = await service.updateUserStatus(req.params.userId, req.body, req.admin, req.ip);
    return sendSuccess(res, { message: 'User status updated', data: { user } });
  } catch (err) {
    return next(err);
  }
}

export async function revokeSessions(req, res, next) {
  try {
    const data = await service.forceLogoutUser(req.params.userId, req.admin, req.ip);
    return sendSuccess(res, { message: 'User sessions revoked', data });
  } catch (err) {
    return next(err);
  }
}