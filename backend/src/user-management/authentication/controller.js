import * as authService from './service.js';
import { COOKIE_NAMES, buildCookieOptions } from '../../config/security.js';
import { sendSuccess } from '../../shared/responses/apiResponse.js';
import { UserSession } from '../../shared/models/UserSession.model.js';

function attachUserCookies(res, { token, csrfToken, sessionLifetimeMs }) {
  res.cookie(COOKIE_NAMES.USER_TOKEN, token, buildCookieOptions(sessionLifetimeMs, true));
  res.cookie(COOKIE_NAMES.USER_CSRF, csrfToken, buildCookieOptions(sessionLifetimeMs, false));
}

export async function register(req, res, next) {
  try {
    const data = await authService.registerUser(req.body);
    return sendSuccess(res, { statusCode: 201, message: 'Registration created. OTP sent for verification.', data });
  } catch (err) {
    return next(err);
  }
}

export async function sendOtp(req, res, next) {
  try {
    const data = await authService.dispatchOtp(req.body.mobile, req.body.purpose);
    return sendSuccess(res, { message: 'OTP dispatched', data });
  } catch (err) {
    return next(err);
  }
}

export async function verifyOtp(req, res, next) {
  try {
    const result = await authService.verifyUserOtp(req.body, {
      ipAddress: req.ip,
      userAgent: req.get('user-agent') || '',
    });
    attachUserCookies(res, result);
    return sendSuccess(res, {
      message: 'Mobile number verified successfully',
      data: { user: result.user, token: result.token, csrfToken: result.csrfToken },
    });
  } catch (err) {
    return next(err);
  }
}

export async function login(req, res, next) {
  try {
    const result = await authService.loginUser(req.body, {
      ipAddress: req.ip,
      userAgent: req.get('user-agent') || '',
    });
    attachUserCookies(res, result);
    return sendSuccess(res, {
      message: 'Login successful',
      data: { user: result.user, token: result.token, csrfToken: result.csrfToken },
    });
  } catch (err) {
    return next(err);
  }
}

export async function me(req, res) {
  return sendSuccess(res, { message: 'Authenticated user fetched', data: { user: req.user } });
}

export async function logout(req, res, next) {
  try {
    await authService.logoutUserSession(req.userSession._id);
    res.clearCookie(COOKIE_NAMES.USER_TOKEN, { path: '/' });
    res.clearCookie(COOKIE_NAMES.USER_CSRF, { path: '/' });
    return sendSuccess(res, { message: 'Logged out successfully' });
  } catch (err) {
    return next(err);
  }
}

export async function listSessions(req, res, next) {
  try {
    const sessions = await UserSession.find({ userId: req.user._id, revokedAt: null })
      .select('userAgent ipAddress createdAt expiresAt')
      .sort({ createdAt: -1 })
      .lean();
    return sendSuccess(res, { message: 'Active sessions fetched', data: { sessions } });
  } catch (err) {
    return next(err);
  }
}

export async function revokeAllSessions(req, res, next) {
  try {
    await authService.revokeAllUserSessions(req.user._id);
    res.clearCookie(COOKIE_NAMES.USER_TOKEN, { path: '/' });
    res.clearCookie(COOKIE_NAMES.USER_CSRF, { path: '/' });
    return sendSuccess(res, { message: 'All active sessions revoked' });
  } catch (err) {
    return next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const data = await authService.resetUserPassword(req.body);
    return sendSuccess(res, { message: 'Password reset successful', data });
  } catch (err) {
    return next(err);
  }
}
