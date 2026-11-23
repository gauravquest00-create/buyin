import * as service from './service.js';
import { COOKIE_NAMES, buildCookieOptions } from '../../config/security.js';
import { sendSuccess } from '../../shared/responses/apiResponse.js';

export async function login(req, res, next) {
  try {
    const result = await service.loginAdmin(req.body, {
      ipAddress: req.ip,
      userAgent: req.get('user-agent') || '',
    });
    if (result.mfaRequired) {
      return sendSuccess(res, { message: 'MFA code required to complete login', data: { mfaRequired: true } });
    }
    res.cookie(COOKIE_NAMES.ADMIN_TOKEN, result.token, buildCookieOptions(result.sessionLifetimeMs, true));
    res.cookie(COOKIE_NAMES.ADMIN_CSRF, result.csrfToken, buildCookieOptions(result.sessionLifetimeMs, false));
    return sendSuccess(res, {
      message: 'Administrator authenticated',
      data: { admin: result.admin, token: result.token, csrfToken: result.csrfToken },
    });
  } catch (err) {
    return next(err);
  }
}

export async function me(req, res) {
  return sendSuccess(res, { message: 'Admin profile fetched', data: { admin: req.admin } });
}

export async function enrollMfa(req, res, next) {
  try {
    const data = await service.enrollMfa(req.admin._id);
    return sendSuccess(res, { message: 'MFA enrollment initiated', data });
  } catch (err) {
    return next(err);
  }
}

export async function confirmMfa(req, res, next) {
  try {
    const data = await service.confirmMfaEnrollment(req.admin._id, req.body.totpCode, req.ip);
    return sendSuccess(res, { message: 'MFA enabled successfully', data });
  } catch (err) {
    return next(err);
  }
}

export async function changePassword(req, res, next) {
  try {
    const data = await service.changeAdminPassword(req.admin._id, req.body, req.ip);
    res.clearCookie(COOKIE_NAMES.ADMIN_TOKEN, { path: '/' });
    res.clearCookie(COOKIE_NAMES.ADMIN_CSRF, { path: '/' });
    return sendSuccess(res, { message: 'Password updated. Please login again.', data });
  } catch (err) {
    return next(err);
  }
}

export async function logout(req, res, next) {
  try {
    await service.logoutAdminSession(req.adminSession._id, req.admin, req.ip);
    res.clearCookie(COOKIE_NAMES.ADMIN_TOKEN, { path: '/' });
    res.clearCookie(COOKIE_NAMES.ADMIN_CSRF, { path: '/' });
    return sendSuccess(res, { message: 'Administrator logged out' });
  } catch (err) {
    return next(err);
  }
}
