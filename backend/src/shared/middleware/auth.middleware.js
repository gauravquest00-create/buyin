import jwt from 'jsonwebtoken';
import env from '../../config/environment.js';
import { COOKIE_NAMES } from '../../config/security.js';
import { UnauthorizedError, ForbiddenError } from '../errors/AppError.js';
import { UserSession } from '../models/UserSession.model.js';
import { AdminSession } from '../models/AdminSession.model.js';
import { User } from '../models/User.model.js';
import { Admin } from '../models/Admin.model.js';
import { UserStatus, VerificationStatus } from '../enums/index.js';

export const TOKEN_AUDIENCE = Object.freeze({
  USER: 'buyin:user',
  ADMIN: 'buyin:admin',
});

function extractToken(req, cookieName) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return { token: authHeader.slice(7).trim(), viaCookie: false };
  }
  if (req.cookies && req.cookies[cookieName]) {
    return { token: req.cookies[cookieName], viaCookie: true };
  }
  return { token: null, viaCookie: false };
}

function assertCsrfIfCookieMutating(req, csrfCookieName) {
  const safeMethods = new Set(['GET', 'HEAD', 'OPTIONS']);
  if (safeMethods.has(req.method)) return;

  const cookieCsrf = req.cookies?.[csrfCookieName];
  const headerCsrf = req.headers['x-csrf-token'];
  if (cookieCsrf && headerCsrf && cookieCsrf === headerCsrf) {
    return;
  }

  const origin = String(req.headers.origin || '').replace(/\/$/, '');
  if (origin && env.allowedOrigins.includes(origin)) {
    return;
  }

  throw new ForbiddenError('CSRF token validation failed', 'CSRF_VALIDATION_FAILED');
}

/**
 * Strictly isolated User Authentication Middleware.
 * Rejects any Admin token (wrong secret, wrong audience, wrong session store).
 */
export async function userAuthMiddleware(req, _res, next) {
  try {
    const { token, viaCookie } = extractToken(req, COOKIE_NAMES.USER_TOKEN);
    if (!token) throw new UnauthorizedError('User authentication required', 'USER_AUTH_REQUIRED');
    if (viaCookie) assertCsrfIfCookieMutating(req, COOKIE_NAMES.USER_CSRF);

    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET, {
        audience: TOKEN_AUDIENCE.USER,
        issuer: 'buyin-api',
      });
    } catch {
      throw new UnauthorizedError('Invalid or expired user session token', 'INVALID_USER_TOKEN');
    }

    if (decoded.domain !== 'user' || !decoded.sid || !decoded.sub) {
      throw new UnauthorizedError('Invalid user token domain', 'INVALID_TOKEN_DOMAIN');
    }

    const session = await UserSession.findOne({
      _id: decoded.sid,
      userId: decoded.sub,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    }).lean();

    if (!session) {
      throw new UnauthorizedError('User session expired or revoked', 'SESSION_REVOKED');
    }

    const user = await User.findById(decoded.sub).select('-passwordHash').lean();
    if (!user) throw new UnauthorizedError('User account not found', 'USER_NOT_FOUND');
    if (user.status === UserStatus.SUSPENDED) {
      throw new ForbiddenError('Your account has been suspended. Contact BUYIN support.', 'ACCOUNT_SUSPENDED');
    }

    req.user = user;
    req.userSession = session;
    return next();
  } catch (err) {
    return next(err);
  }
}

/**
 * Ensures the user is verified and active before claiming leads or requesting refunds.
 */
export function requireVerifiedUser(req, _res, next) {
  if (!req.user) return next(new UnauthorizedError());
  if (req.user.status !== UserStatus.ACTIVE || req.user.verificationStatus !== VerificationStatus.APPROVED) {
    return next(
      new ForbiddenError(
        'Professional verification must be approved before performing this action.',
        'VERIFICATION_REQUIRED'
      )
    );
  }
  return next();
}

/**
 * Strictly isolated Super Admin Authentication Middleware.
 * Rejects any User token and enforces MFA completion when enabled.
 */
export async function adminAuthMiddleware(req, _res, next) {
  try {
    const { token, viaCookie } = extractToken(req, COOKIE_NAMES.ADMIN_TOKEN);
    if (!token) throw new UnauthorizedError('Administrator authentication required', 'ADMIN_AUTH_REQUIRED');
    if (viaCookie) assertCsrfIfCookieMutating(req, COOKIE_NAMES.ADMIN_CSRF);

    let decoded;
    try {
      decoded = jwt.verify(token, env.ADMIN_JWT_SECRET, {
        audience: TOKEN_AUDIENCE.ADMIN,
        issuer: 'buyin-api',
      });
    } catch {
      throw new UnauthorizedError('Invalid or expired admin session token', 'INVALID_ADMIN_TOKEN');
    }

    if (decoded.domain !== 'superadmin' || !decoded.sid || !decoded.sub) {
      throw new UnauthorizedError('Invalid admin token domain', 'INVALID_TOKEN_DOMAIN');
    }

    const session = await AdminSession.findOne({
      _id: decoded.sid,
      adminId: decoded.sub,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    }).lean();

    if (!session) {
      throw new UnauthorizedError('Admin session expired or revoked', 'ADMIN_SESSION_REVOKED');
    }

    const admin = await Admin.findById(decoded.sub).select('-passwordHash -mfaSecret').populate('roleId').lean();
    if (!admin || !admin.isActive) {
      throw new ForbiddenError('Administrator account is inactive', 'ADMIN_INACTIVE');
    }

    if (admin.mfaEnabled && !session.mfaVerified) {
      throw new ForbiddenError('MFA verification is required for this session', 'MFA_REQUIRED');
    }

    const permissions = Array.from(
      new Set([...(admin.roleId?.permissions || []), ...(admin.customPermissions || [])])
    );

    req.admin = {
      ...admin,
      roleName: admin.roleId?.name || 'Staff',
      permissions,
    };
    req.adminSession = session;
    return next();
  } catch (err) {
    return next(err);
  }
}
