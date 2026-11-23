import { Wallet } from '../../shared/models/Wallet.model.js';
import { WalletTransaction } from '../../shared/models/WalletTransaction.model.js';
import { creditWalletPoints, debitWalletPoints } from '../../logics/wallet/wallet.logic.js';
import { WalletTxType } from '../../shared/enums/index.js';
import { generateRandomToken } from '../../shared/utils/crypto.js';
import { recordAdminAudit } from '../_helpers/audit.helper.js';

export async function listWallets() {
  return Wallet.find().populate('userId', 'fullName email mobile agencyName').sort({ balancePoints: -1 }).limit(100).lean();
}

export async function listLedger(query) {
  const filter = {};
  if (query.userId) filter.userId = query.userId;
  if (query.type) filter.type = query.type;
  return WalletTransaction.find(filter)
    .populate('userId', 'fullName email')
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
}

export async function adjustWallet({ userId, direction, points, reason }, admin, ipAddress) {
  const idempotencyKey = `admin-adj:${admin._id}:${userId}:${generateRandomToken(8)}`;
  const fn = direction === 'CREDIT' ? creditWalletPoints : debitWalletPoints;
  const type = direction === 'CREDIT' ? WalletTxType.MANUAL_CREDIT : WalletTxType.MANUAL_DEBIT;

  const result = await fn({
    userId,
    points,
    type,
    reason: `Admin adjustment: ${reason}`,
    idempotencyKey,
    referenceType: 'ADMIN_ADJUSTMENT',
    performedByAdminId: admin._id,
  });

  await recordAdminAudit({
    admin,
    action: `WALLET_MANUAL_${direction}`,
    module: 'wallet-management',
    targetType: 'Wallet',
    targetId: result.wallet._id,
    reason,
    afterState: { points, balanceAfter: result.wallet.balancePoints, txCode: result.transaction.txCode },
    ipAddress,
  });

  return result;
}
