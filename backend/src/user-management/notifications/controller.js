import * as service from './service.js';
import { sendSuccess } from '../../shared/responses/apiResponse.js';

export async function list(req, res, next) {
  try {
    const data = await service.listNotifications(req.user._id);
    return sendSuccess(res, { message: 'Notifications fetched', data });
  } catch (err) {
    return next(err);
  }
}

export async function markRead(req, res, next) {
  try {
    await service.markRead(req.user._id, req.params.id);
    return sendSuccess(res, { message: 'Notification marked as read' });
  } catch (err) {
    return next(err);
  }
}

export async function markAllRead(req, res, next) {
  try {
    await service.markAllRead(req.user._id);
    return sendSuccess(res, { message: 'All notifications marked as read' });
  } catch (err) {
    return next(err);
  }
}
