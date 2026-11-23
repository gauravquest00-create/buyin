import jwt from 'jsonwebtoken';
import env from '../../config/environment.js';
import { Admin } from '../../shared/models/Admin.model.js';
import { AdminSession } from '../../shared/models/AdminSession.model.js';
import { TOKEN_AUDIENCE } from '../../shared/middleware/auth.middleware.js';
import { AppError, ForbiddenError, UnauthorizedError, ValidationError } from '../../shared/errors/AppError.js';
import {
  buildTotpOtpAuthUri,
  generateBase32Secret,
  generateRandomToken,
  hashPassword,
  sha256,
  verifyPassword,
  verifyTotpCode,
} from '../../shared/utils/crypto.js';
import { recordAdminAudit } from '../_helpers/audit.helper.js';

async function issueAdminSession(admin, { mfaVerified, ipAddress = '', userAgent = '' }) {
  const sessionLifetimeMs = 8 * 60 * 60 * 1000;
  const expiresAt = new Date(Date.now() + sessionLifetimeMs);
  const csrfToken = generateRandomToken(24);
  const session = await AdminSession.create({
    adminId: admin._id,
    tokenHash: sha256(generateRandomToken(16)),
    mfaVerified,
    ipAddress,
    userAgent,
    expiresAt,
  });

  const token = jwt.sign(
    { sub: String(admin._id), sid: String(session._id), domain: 'superadmin' },
    env.ADMIN_JWT_SECRET,
    { expiresIn: env.ADMIN_JWT_EXPIRES_IN, audience: TOKEN_AUDIENCE.ADMIN, issuer: 'buyin-api' }
  );

  session.tokenHash = sha256(token);
  await session.save();
  return { token, csrfToken, expiresAt, sessionLifetimeMs, session };
}

export async function loginAdmin({ email, password, totpCode }, meta = {}) {
  const admin = await Admin.findOne({ email: email.toLowerCase() })
    .select('+passwordHash +mfaSecret')
    .populate('roleId');
  if (!admin || !admin.isActive) {
    throw new UnauthorizedError('Invalid administrator credentials', 'INVALID_ADMIN_CREDENTIALS');
  }
  if (admin.lockUntil && admin.lockUntil > new Date()) {
    throw new AppError('Administrator account temporarily locked due to failed attempts', 423, 'ADMIN_LOCKED');
  }

  const valid = await verifyPassword(password, admin.passwordHash);
  if (!valid) {
    admin.failedLoginAttempts += 1;
    if (admin.failedLoginAttempts >= 5) {
      admin.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
    }
    await admin.save();
    throw new UnauthorizedError('Invalid administrator credentials', 'INVALID_ADMIN_CREDENTIALS');
  }

  if (admin.mfaEnabled) {
    if (!totpCode) {
      return { mfaRequired: true, email: admin.email };
    }
    const okMfa = verifyTotpCode(admin.mfaSecret, totpCode);
    if (!okMfa) {
      throw new UnauthorizedError('Invalid MFA authenticator code', 'INVALID_MFA_CODE');
    }
  }

  admin.failedLoginAttempts = 0;
  admin.lockUntil = null;
  admin.lastLoginAt = new Date();
  await admin.save();

  const sessionData = await issueAdminSession(admin, {
    mfaVerified: true,
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  await recordAdminAudit({
    admin,
    action: 'ADMIN_LOGIN',
    module: 'authentication',
    ipAddress: meta.ipAddress,
  });

  return {
    mfaRequired: false,
    admin: {
      _id: admin._id,
      fullName: admin.fullName,
      email: admin.email,
      roleName: admin.roleId?.name,
      permissions: Array.from(new Set([...(admin.roleId?.permissions || []), ...(admin.customPermissions || [])])),
      mfaEnabled: admin.mfaEnabled,
      mustChangePassword: admin.mustChangePassword,
    },
    ...sessionData,
  };
}

export async function enrollMfa(adminId) {
  const admin = await Admin.findById(adminId).select('+mfaSecret');
  if (!admin) throw new UnauthorizedError('Admin not found');
  const secret = generateBase32Secret();
  admin.mfaSecret = secret;
  await admin.save();
  return {
    secret,
    otpAuthUri: buildTotpOtpAuthUri({ email: admin.email, secret }),
  };
}

export async function confirmMfaEnrollment(adminId, totpCode, ipAddress = '') {
  const admin = await Admin.findById(adminId).select('+mfaSecret');
  if (!admin || !admin.mfaSecret) throw new ValidationError('Start MFA enrollment first');
  if (!verifyTotpCode(admin.mfaSecret, totpCode)) {
    throw new ValidationError('Invalid 6-digit TOTP code');
  }
  admin.mfaEnabled = true;
  await admin.save();
  await recordAdminAudit({ admin, action: 'ADMIN_MFA_ENABLED', module: 'authentication', ipAddress });
  return { mfaEnabled: true };
}

export async function changeAdminPassword(adminId, { currentPassword, newPassword }, ipAddress = '') {
  const admin = await Admin.findById(adminId).select('+passwordHash');
  const ok = await verifyPassword(currentPassword, admin.passwordHash);
  if (!ok) throw new UnauthorizedError('Current password is incorrect');
  admin.passwordHash = await hashPassword(newPassword);
  admin.mustChangePassword = false;
  await admin.save();
  await AdminSession.updateMany({ adminId: admin._id, revokedAt: null }, { $set: { revokedAt: new Date() } });
  await recordAdminAudit({ admin, action: 'ADMIN_PASSWORD_CHANGED', module: 'authentication', ipAddress });
  return { changed: true };
}

export async function logoutAdminSession(sessionId, admin, ipAddress = '') {
  await AdminSession.findByIdAndUpdate(sessionId, { $set: { revokedAt: new Date() } });
  await recordAdminAudit({ admin, action: 'ADMIN_LOGOUT', module: 'authentication', ipAddress });
}
