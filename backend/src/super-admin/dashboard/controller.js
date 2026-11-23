import * as service from './service.js';
import { sendSuccess } from '../../shared/responses/apiResponse.js';

export async function overview(_req, res, next) {
  try {
    const data = await service.getAdminDashboardOverview();
    return sendSuccess(res, { message: 'Admin dashboard overview fetched', data });
  } catch (err) {
    return next(err);
  }
}
