import * as service from './service.js';
import { sendSuccess } from '../../shared/responses/apiResponse.js';

export async function list(_req, res, next) {
  try {
    const notifications = await service.listRecentNotifications();
    return sendSuccess(res, { message: 'Notifications fetched', data: { notifications } });
  } catch (err) { return next(err); }
}

export async function broadcast(req, res, next) {
  try {
    const data = await service.broadcastNotification(req.body, req.admin, req.ip);
    return sendSuccess(res, { statusCode: 201, message: 'Notification broadcast sent', data });
  } catch (err) { return next(err); }
}
