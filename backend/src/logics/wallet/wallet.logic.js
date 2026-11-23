import { Wallet } from '../../shared/models/Wallet.model.js';
import { WalletTransaction } from '../../shared/models/WalletTransaction.model.js';
import { BUSINESS_RULES } from '../../shared/constants/index.js';
import { AppError, ConflictError, ValidationError } from '../../shared/errors/AppError.js';
import { generateCode } from '../../shared/utils/crypto.js';
import { WalletTxType } from '../../shared/enums/index.js';

/**
 * Pure calculator for custom recharge: minimum ₹500, 0.9 points per rupee, no bonus.
 */
export function calculateCustomRecharge(amountInr) {
  const numericAmount = Number(amountInr);
  if (!Number.isFinite(numericAmount) || numericAmount < BUSINESS_RULES.CUSTOM_RECHARGE_MIN_INR) {
    throw new ValidationError(`Minimum custom recharge is ₹${BUSINESS_RULES.CUSTOM_RECHARGE_MIN_INR}`);
  }
  const basePoints = Math.round(numericAmount * BUSINESS_RULES.CUSTOM_RECHARGE_POINTS_PER_INR);
  return {
    amountInr: numericAmount,
    amountPaise: Math.round(numericAmount * 100),
    basePoints,
    bonusPoints: 0,
    totalPoints: basePoints,
  };
}

export async function ensureWallet(userId, session = null) {
  let wallet = await Wallet.findOne({ userId }).session(session);
  if (!wallet) {
    const created = await Wallet.create([{ userId, balancePoints: 0 }], { session });
    wallet = created[0];
  }
  return wallet;
}

/**
 * Atomic, idempotent wallet credit with immutable ledger entry.
 */
export async function creditWalletPoints({
  userId,
  points,
  type,
  reason,
  idempotencyKey,
  referenceType,
  referenceId = null,
  performedByAdminId = null,
  metadata = {},
  session = null,
}) {
  const numericPoints = Math.round(Number(points));
  if (!Number.isFinite(numericPoints) || numericPoints <= 0) {
    throw new ValidationError('Credit points must be a positive integer');
  }

  const existingTx = await WalletTransaction.findOne({ idempotencyKey }).session(session);
  if (existingTx) {
    const wallet = await Wallet.findOne({ userId }).session(session);
    return { wallet, transaction: existingTx, idempotentReplay: true };
  }

  const wallet = await ensureWallet(userId, session);
  const balanceBefore = wallet.balancePoints;
  const balanceAfter = balanceBefore + numericPoints;

  const incFields = { balancePoints: numericPoints };
  if (type === WalletTxType.RECHARGE) incFields.totalRechargedPoints = numericPoints;
  if (type === WalletTxType.BONUS_CREDIT) incFields.totalBonusPoints = numericPoints;
  if (type === WalletTxType.REFUND_CREDIT) incFields.totalRefundedPoints = numericPoints;

  const updatedWallet = await Wallet.findOneAndUpdate(
    { _id: wallet._id },
    { $inc: incFields },
    { new: true, session }
  );

  const [tx] = await WalletTransaction.create(
    [
      {
        txCode: generateCode('WTX'),
        walletId: wallet._id,
        userId,
        type,
        direction: 'CREDIT',
        points: numericPoints,
        balanceBefore,
        balanceAfter,
        reason,
        idempotencyKey,
        referenceType,
        referenceId,
        performedByAdminId,
        metadata,
      },
    ],
    { session }
  );

  return { wallet: updatedWallet, transaction: tx, idempotentReplay: false };
}

/**
 * Atomic, idempotent wallet debit with strict balance guard and immutable ledger entry.
 */
export async function debitWalletPoints({
  userId,
  points,
  type,
  reason,
  idempotencyKey,
  referenceType,
  referenceId = null,
  performedByAdminId = null,
  metadata = {},
  session = null,
}) {
  const numericPoints = Math.round(Number(points));
  if (!Number.isFinite(numericPoints) || numericPoints <= 0) {
    throw new ValidationError('Debit points must be a positive integer');
  }

  const existingTx = await WalletTransaction.findOne({ idempotencyKey }).session(session);
  if (existingTx) {
    const wallet = await Wallet.findOne({ userId }).session(session);
    return { wallet, transaction: existingTx, idempotentReplay: true };
  }

  await ensureWallet(userId, session);

  // Conditional atomic deduction prevents negative balance under concurrency
  const updatedWallet = await Wallet.findOneAndUpdate(
    { userId, balancePoints: { $gte: numericPoints } },
    { $inc: { balancePoints: -numericPoints, totalSpentPoints: numericPoints } },
    { new: true, session }
  );

  if (!updatedWallet) {
    throw new AppError('Insufficient claim points in wallet', 402, 'INSUFFICIENT_WALLET_BALANCE');
  }

  const balanceAfter = updatedWallet.balancePoints;
  const balanceBefore = balanceAfter + numericPoints;

  const [tx] = await WalletTransaction.create(
    [
      {
        txCode: generateCode('WTX'),
        walletId: updatedWallet._id,
        userId,
        type,
        direction: 'DEBIT',
        points: numericPoints,
        balanceBefore,
        balanceAfter,
        reason,
        idempotencyKey,
        referenceType,
        referenceId,
        performedByAdminId,
        metadata,
      },
    ],
    { session }
  );

  return { wallet: updatedWallet, transaction: tx, idempotentReplay: false };
}
