import * as service from './service.js';
import { sendSuccess } from '../../shared/responses/apiResponse.js';

export async function list(_req, res, next) {
  try {
    const settings = await service.listSettings();
    return sendSuccess(res, { message: 'System settings fetched', data: { settings } });
  } catch (err) { return next(err); }
}

export async function upsert(req, res, next) {
  try {
    const setting = await service.upsertSetting(req.body, req.admin, req.ip);
    return sendSuccess(res, { message: 'System setting updated', data: { setting } });
  } catch (err) { return next(err); }
}
