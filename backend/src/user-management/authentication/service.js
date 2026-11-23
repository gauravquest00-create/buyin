import jwt from 'jsonwebtoken';
import env from '../../config/environment.js';
import { OTP_CONFIG, generateNumericOtp, hashOtp, sendOtpSms, verifyOtpHash } from '../../config/fast2sms.js';
import { User } from '../../shared/models/User.model.js';
import { UserSession } from '../../shared/models/UserSession.model.js';
import { OtpRecord } from '../../shared/models/OtpRecord.model.js';
import { ensureWallet } from '../../logics/wallet/wallet.logic.js';
import { TOKEN_AUDIENCE } from '../../shared/middleware/auth.middleware.js';
import { UserStatus } from '../../shared/enums/index.js';
import { AppError, ConflictError, ForbiddenError, NotFoundError, UnauthorizedError, ValidationError } from '../../shared/errors/AppError.js';
import { generateRandomToken, hashPassword, sha256, verifyPassword } from '../../shared/utils/crypto.js';

function normalizeMobile(mobile) {
  const digits = String(mobile).replace(/\D/g, '');
  return digits.length === 10 ? `+91${digits}` : `+${digits}`;
}

async function issueUserSession(user, { ipAddress = '', userAgent = '' } = {}) {
  const sessionLifetimeMs = 7 * 24 * 60 * 60 * 1000;
  const expiresAt = new Date(Date.now() + sessionLifetimeMs);
  const csrfToken = generateRandomToken(24);
  const placeholderHash = sha256(generateRandomToken(16));

  const session = await UserSession.create({
    userId: user._id,
    tokenHash: placeholderHash,
    ipAddress,
    userAgent,
    expiresAt,
  });

  const token = jwt.sign(
    { sub: String(user._id), sid: String(session._id), domain: 'user' },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN, audience: TOKEN_AUDIENCE.USER, issuer: 'buyin-api' }
  );

  session.tokenHash = sha256(token);
  await session.save();

  return { token, csrfToken, expiresAt, sessionLifetimeMs };
}

export async function dispatchOtp(mobile, purpose = 'REGISTER') {
  const normalized = normalizeMobile(mobile);
  const now = new Date();
  const existing = await OtpRecord.findOne({ identifier: normalized, purpose, verifiedAt: null }).sort({ createdAt: -1 });

  if (existing) {
    const secondsSinceLast = (now.getTime() - new Date(existing.lastSentAt).getTime()) / 1000;
    if (secondsSinceLast < OTP_CONFIG.RESEND_COOLDOWN_SECONDS) {
      throw new AppError(
        `Please wait ${Math.ceil(OTP_CONFIG.RESEND_COOLDOWN_SECONDS - secondsSinceLast)}s before resending OTP`,
        429,
        'OTP_COOLDOWN'
      );
    }
    if (existing.resendCount >= OTP_CONFIG.MAX_RESENDS_PER_HOUR) {
      throw new AppError('Maximum OTP resend limit reached for this hour', 429, 'OTP_RESEND_LIMIT');
    }
  }

  const otp = generateNumericOtp();
  const otpHash = hashOtp(otp, `${normalized}:${purpose}`);
  const expiresAt = new Date(now.getTime() + OTP_CONFIG.EXPIRY_MINUTES * 60 * 1000);
  const delivery = await sendOtpSms(normalized, otp);

  const record = await OtpRecord.create({
    identifier: normalized,
    purpose,
    otpHash,
    resendCount: existing ? existing.resendCount + 1 : 1,
    lastSentAt: now,
    deliveryStatus: delivery.status || (delivery.delivered ? 'DELIVERED' : 'FAILED'),
    providerRequestId: delivery.providerRequestId || null,
    expiresAt,
  });

  return {
    mobile: normalized,
    purpose,
    expiresAt: record.expiresAt,
    deliveryStatus: record.deliveryStatus,
    provider: delivery.provider,
  };
}

export async function registerUser(input) {
  const normalizedMobile = normalizeMobile(input.mobile);
  const existing = await User.findOne({
    $or: [{ email: input.email.toLowerCase() }, { mobile: normalizedMobile }],
  });
  if (existing) {
    throw new ConflictError('An account with this email or mobile number already exists', 'USER_EXISTS');
  }

  const passwordHash = await hashPassword(input.password);
  const user = await User.create({
    fullName: input.fullName,
    mobile: normalizedMobile,
    email: input.email.toLowerCase(),
    passwordHash,
    status: UserStatus.PENDING_OTP,
  });

  await ensureWallet(user._id);
  const otpInfo = await dispatchOtp(normalizedMobile, 'REGISTER');

  return {
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      mobile: user.mobile,
      status: user.status,
      verificationStatus: user.verificationStatus,
    },
    otp: otpInfo,
  };
}

export async function verifyUserOtp({ mobile, otp, purpose = 'REGISTER' }, meta = {}) {
  const normalized = normalizeMobile(mobile);
  const record = await OtpRecord.findOne({
    identifier: normalized,
    purpose,
    verifiedAt: null,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!record) {
    throw new ValidationError('OTP has expired or was not requested');
  }
  if (record.attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
    throw new AppError('Maximum OTP verification attempts exceeded. Request a new OTP.', 429, 'OTP_MAX_ATTEMPTS');
  }

  const ok = verifyOtpHash(otp, `${normalized}:${purpose}`, record.otpHash);
  if (!ok) {
    record.attempts += 1;
    await record.save();
    throw new ValidationError('Invalid OTP code');
  }

  record.verifiedAt = new Date();
  await record.save();

  const user = await User.findOne({ mobile: normalized });
  if (!user) throw new NotFoundError('User account not found');

  user.mobileVerified = true;
  if (user.status === UserStatus.PENDING_OTP) {
    user.status = UserStatus.PENDING_ONBOARDING;
  }
  user.lastLoginAt = new Date();
  await user.save();

  const sessionInfo = await issueUserSession(user, meta);
  return {
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      mobile: user.mobile,
      status: user.status,
      verificationStatus: user.verificationStatus,
      mobileVerified: user.mobileVerified,
    },
    ...sessionInfo,
  };
}

export async function loginUser({ identifier, password }, meta = {}) {
  const query = identifier.includes('@')
    ? { email: identifier.toLowerCase() }
    : { mobile: normalizeMobile(identifier) };

  const user = await User.findOne(query).select('+passwordHash');
  if (!user) throw new UnauthorizedError('Invalid credentials', 'INVALID_CREDENTIALS');

  if (user.lockUntil && user.lockUntil > new Date()) {
    throw new AppError('Account temporarily locked due to failed login attempts. Try again later.', 423, 'ACCOUNT_LOCKED');
  }
  if (user.status === UserStatus.SUSPENDED) {
    throw new ForbiddenError('Account is suspended. Contact BUYIN support.', 'ACCOUNT_SUSPENDED');
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
    }
    await user.save();
    throw new UnauthorizedError('Invalid credentials', 'INVALID_CREDENTIALS');
  }

  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  user.lastLoginAt = new Date();
  await user.save();

  await ensureWallet(user._id);
  const sessionInfo = await issueUserSession(user, meta);

  return {
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      mobile: user.mobile,
      status: user.status,
      verificationStatus: user.verificationStatus,
      city: user.city,
      agencyName: user.agencyName,
    },
    ...sessionInfo,
  };
}

export async function resetUserPassword({ mobile, otp, newPassword }) {
  const normalized = normalizeMobile(mobile);
  const record = await OtpRecord.findOne({
    identifier: normalized,
    purpose: 'PASSWORD_RESET',
    verifiedAt: null,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!record || !verifyOtpHash(otp, `${normalized}:PASSWORD_RESET`, record.otpHash)) {
    throw new ValidationError('Invalid or expired password reset OTP');
  }
  record.verifiedAt = new Date();
  await record.save();

  const user = await User.findOne({ mobile: normalized });
  if (!user) throw new NotFoundError('User account not found');
  user.passwordHash = await hashPassword(newPassword);
  await user.save();

  // Revoke all existing sessions on password reset
  await UserSession.updateMany({ userId: user._id, revokedAt: null }, { $set: { revokedAt: new Date() } });
  return { reset: true };
}

export async function logoutUserSession(sessionId) {
  await UserSession.findByIdAndUpdate(sessionId, { $set: { revokedAt: new Date() } });
}

export async function revokeAllUserSessions(userId) {
  await UserSession.updateMany({ userId, revokedAt: null }, { $set: { revokedAt: new Date() } });
}
