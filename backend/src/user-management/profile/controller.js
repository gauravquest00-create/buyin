import * as service from './service.js';
import { sendSuccess } from '../../shared/responses/apiResponse.js';

export async function getProfile(req, res, next) {
  try {
    const profile = await service.getProfile(req.user._id);
    return sendSuccess(res, { message: 'Profile fetched', data: { profile } });
  } catch (err) {
    return next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const profile = await service.updateProfile(req.user._id, req.body);
    return sendSuccess(res, { message: 'Profile updated', data: { profile } });
  } catch (err) {
    return next(err);
  }
}

export async function uploadAvatar(req, res, next) {
  try {
    const avatar = await service.uploadAvatar(req.user._id, req.file);
    return sendSuccess(res, { message: 'Avatar uploaded', data: { avatar } });
  } catch (err) {
    return next(err);
  }
}
