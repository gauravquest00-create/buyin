import { User } from '../../shared/models/User.model.js';
import { Wallet } from '../../shared/models/Wallet.model.js';
import { WalletTransaction } from '../../shared/models/WalletTransaction.model.js';
import { Claim } from '../../shared/models/Claim.model.js';
import { Payment } from '../../shared/models/Payment.model.js';
import { RefundRequest } from '../../shared/models/RefundRequest.model.js';
import { VerificationRecord } from '../../shared/models/VerificationRecord.model.js';
import { UserSession } from '../../shared/models/UserSession.model.js';
import { UserStatus } from '../../shared/enums/index.js';
import { buildPaginationMeta } from '../../shared/responses/apiResponse.js';
import { NotFoundError } from '../../shared/errors/AppError.js';
import { recordAdminAudit } from '../_helpers/audit.helper.js';

export async function listUsers(query) {
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.verificationStatus) filter.verificationStatus = query.verificationStatus;
  if (query.search) {
    const rx = new RegExp(query.search, 'i');
    filter.$or = [{ fullName: rx }, { email: rx }, { mobile: rx }, { city: rx }, { agencyName: rx }];
  }
  const page = Number(query.page) || 1;
  const limit = Math.min(100, Number(query.limit) || 25);
  const [users, total] = await Promise.all([
    User.find(filter).select('-passwordHash').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    User.countDocuments(filter),
  ]);
  const userIds = users.map((u) => u._id);
  const wallets = await Wallet.find({ userId: { $in: userIds } }).lean();
  const walletMap = new Map(wallets.map((w) => [String(w.userId), w.balancePoints]));
  const enriched = users.map((u) => ({ ...u, walletBalancePoints: walletMap.get(String(u._id)) ?? 0 }));
  return { users: enriched, meta: buildPaginationMeta(page, limit, total) };
}

export async function getUserDetail(userId) {
  const user = await User.findById(userId).select('-passwordHash').lean();
  if (!user) throw new NotFoundError('User not found', 'USER_NOT_FOUND');

  const [wallet, transactions, claims, payments, refunds, verifications, activeSessionsCount] = await Promise.all([
    Wallet.findOne({ userId }).lean(),
    WalletTransaction.find({ userId }).sort({ createdAt: -1 }).limit(20).lean(),
    Claim.find({ userId }).populate('leadId', 'leadCode title city location currentLeadStatus').sort({ createdAt: -1 }).limit(20).lean(),
    Payment.find({ userId }).sort({ createdAt: -1 }).limit(15).lean(),
    RefundRequest.find({ userId }).populate('leadId', 'leadCode title').sort({ createdAt: -1 }).limit(15).lean(),
    VerificationRecord.find({ userId }).sort({ createdAt: -1 }).limit(5).lean(),
    UserSession.countDocuments({ userId, revokedAt: null, expiresAt: { $gt: new Date() } }),
  ]);

  return {
    user,
    wallet: wallet || { balancePoints: 0, totalRechargedPoints: 0, totalBonusPoints: 0, totalSpentPoints: 0, totalRefundedPoints: 0 },
    transactions,
    claims,
    payments,
    refunds,
    verifications,
    activeSessionsCount,
  };
}

export async function updateUserStatus(userId, { status, reason }, admin, ipAddress) {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError('User not found', 'USER_NOT_FOUND');
  const prev = user.status;
  user.status = status;
  if (status === UserStatus.SUSPENDED) {
    user.suspensionReason = reason;
    await UserSession.updateMany({ userId: user._id, revokedAt: null }, { $set: { revokedAt: new Date() } });
  } else if (status === UserStatus.ACTIVE) {
    user.suspensionReason = '';
  }
  await user.save();
  await recordAdminAudit({
    admin,
    action: 'USER_STATUS_UPDATED',
    module: 'user-management',
    targetType: 'User',
    targetId: user._id,
    reason,
    beforeState: { status: prev },
    afterState: { status },
    ipAddress,
  });
  return user;
}

export async function forceLogoutUser(userId, admin, ipAddress) {
  const res = await UserSession.updateMany({ userId, revokedAt: null }, { $set: { revokedAt: new Date() } });
  await recordAdminAudit({
    admin,
    action: 'USER_SESSIONS_REVOKED',
    module: 'user-management',
    targetType: 'User',
    targetId: userId,
    reason: 'Admin forced logout of all active user sessions',
    afterState: { revokedCount: res.modifiedCount },
    ipAddress,
  });
  return { revokedCount: res.modifiedCount };
}