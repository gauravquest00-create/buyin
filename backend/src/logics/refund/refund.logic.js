import { withTransaction } from '../../config/database.js';
import { BUSINESS_RULES } from '../../shared/constants/index.js';
import { ClaimStatus, LeadPoolState, RefundLeadOutcome, RefundStatus, WalletTxType } from '../../shared/enums/index.js';
import { Claim } from '../../shared/models/Claim.model.js';
import { Lead } from '../../shared/models/Lead.model.js';
import { RefundRequest } from '../../shared/models/RefundRequest.model.js';
import { Notification } from '../../shared/models/Notification.model.js';
import { AuditLog } from '../../shared/models/AuditLog.model.js';
import { creditWalletPoints } from '../wallet/wallet.logic.js';
import { ConflictError, NotFoundError, ValidationError } from '../../shared/errors/AppError.js';
import { generateCode } from '../../shared/utils/crypto.js';

/**
 * Pure refund math:
 * - Refund credit: 95% of original claim points, rounded to nearest whole point
 * - Refund deduction: originalClaimPoints - refundablePoints (5%)
 */
export function calculateRefundBreakdown(originalClaimPoints) {
  const original = Math.round(Number(originalClaimPoints));
  if (!Number.isFinite(original) || original <= 0) {
    throw new ValidationError('Original claim points must be a positive number');
  }
  const refundablePoints = Math.round(original * BUSINESS_RULES.REFUND_CREDIT_RATIO);
  const deductionPoints = original - refundablePoints;
  return {
    originalClaimPoints: original,
    deductionPercent: 5,
    refundPercent: 95,
    deductionPoints,
    refundablePoints,
  };
}

/**
 * User submits a refund request — places Claim and Lead into protective REVIEW_HOLD
 * so background jobs cannot expire or re-claim the lead during admin review.
 */
export async function submitRefundRequest({ userId, claimId, reason, description, evidenceFiles = [] }) {
  return withTransaction(async (session) => {
    const claim = await Claim.findOne({ _id: claimId, userId }).session(session);
    if (!claim) throw new NotFoundError('Claim not found', 'CLAIM_NOT_FOUND');

    if (![ClaimStatus.ACTIVE, ClaimStatus.EXTENDED].includes(claim.status)) {
      throw new ValidationError(`Refund cannot be requested for claim in status ${claim.status}`);
    }

    const existing = await RefundRequest.findOne({ claimId: claim._id }).session(session);
    if (existing) {
      throw new ConflictError('A refund request already exists for this claim', 'REFUND_ALREADY_EXISTS');
    }

    const breakdown = calculateRefundBreakdown(claim.originalClaimPoints);

    const [refund] = await RefundRequest.create(
      [
        {
          refundCode: generateCode('RFD'),
          claimId: claim._id,
          leadId: claim.leadId,
          userId,
          reason,
          description,
          evidenceFiles,
          originalClaimPoints: breakdown.originalClaimPoints,
          deductionPoints: breakdown.deductionPoints,
          refundablePoints: breakdown.refundablePoints,
          status: RefundStatus.SUBMITTED,
        },
      ],
      { session }
    );

    claim.refundHoldActive = true;
    claim.status = ClaimStatus.REFUND_HOLD;
    await claim.save({ session });

    await Lead.findByIdAndUpdate(
      claim.leadId,
      { $set: { poolState: LeadPoolState.REVIEW_HOLD } },
      { session }
    );

    await Notification.create(
      [
        {
          recipientType: 'USER',
          recipientId: userId,
          title: 'Refund Request Submitted',
          message: `Refund ${refund.refundCode} (${breakdown.refundablePoints} pts expected after 5% deduction) is under review.`,
          type: 'REFUND',
          metadata: { refundId: refund._id, claimId: claim._id },
        },
      ],
      { session }
    );

    return refund;
  });
}

/**
 * Admin approves a refund — atomic, idempotent, single-credit execution!
 * Revokes ownership, credits 95% points via immutable ledger, resolves lead outcome,
 * logs audit entry, and notifies the user.
 */
export async function approveRefundAtomically({ refundId, admin, leadOutcome, adminRemarks = '', ipAddress = '' }) {
  if (!Object.values(RefundLeadOutcome).includes(leadOutcome)) {
    throw new ValidationError('Invalid lead outcome for refund approval');
  }

  return withTransaction(async (session) => {
    const refund = await RefundRequest.findOneAndUpdate(
      {
        _id: refundId,
        status: { $in: [RefundStatus.SUBMITTED, RefundStatus.UNDER_REVIEW, RefundStatus.ADDITIONAL_INFO_REQUIRED] },
      },
      {
        $set: {
          status: RefundStatus.CREDITED,
          leadOutcome,
          adminRemarks,
          reviewedByAdminId: admin._id,
          reviewedAt: new Date(),
          creditedAt: new Date(),
        },
      },
      { new: true, session }
    );

    if (!refund) {
      throw new ConflictError('Refund request not found or already processed', 'REFUND_ALREADY_PROCESSED');
    }

    const claim = await Claim.findById(refund.claimId).session(session);
    if (!claim) throw new NotFoundError('Original claim not found', 'CLAIM_NOT_FOUND');

    const { transaction } = await creditWalletPoints({
      userId: refund.userId,
      points: refund.refundablePoints,
      type: WalletTxType.REFUND_CREDIT,
      reason: `Refund approved for ${refund.refundCode} (95% of ${refund.originalClaimPoints} pts; 5% deduction = ${refund.deductionPoints} pts)`,
      idempotencyKey: `refund-credit:${refund._id}`,
      referenceType: 'REFUND',
      referenceId: refund._id,
      performedByAdminId: admin._id,
      metadata: { claimCode: claim.claimCode, leadOutcome },
      session,
    });

    refund.walletTransactionId = transaction._id;
    await refund.save({ session });

    claim.status = ClaimStatus.REFUNDED;
    claim.refundHoldActive = false;
    claim.revokedAt = new Date();
    claim.revocationReason = `Refund approved (${refund.refundCode})`;
    claim.revokedByAdminId = admin._id;
    await claim.save({ session });

    const leadUpdate = {
      activeClaimId: null,
      activeOwnerId: null,
      ownershipExpiresAt: null,
    };
    if (leadOutcome === RefundLeadOutcome.LEAD_BIN) {
      leadUpdate.poolState = LeadPoolState.LEAD_BIN;
      leadUpdate.isPermanentlyClosed = true;
      leadUpdate.closureReason = `Moved to Lead Bin via refund ${refund.refundCode}`;
    } else if (leadOutcome === RefundLeadOutcome.PERMANENTLY_CLOSE) {
      leadUpdate.poolState = LeadPoolState.CLOSED;
      leadUpdate.isPermanentlyClosed = true;
      leadUpdate.closureReason = `Permanently closed via refund ${refund.refundCode}`;
    } else {
      leadUpdate.poolState = LeadPoolState.AVAILABLE;
      leadUpdate.isReturnedLead = true;
      leadUpdate.$inc = { returnCount: 1 };
    }

    const { $inc, ...$set } = leadUpdate;
    await Lead.findByIdAndUpdate(
      refund.leadId,
      $inc ? { $set, $inc } : { $set },
      { session }
    );

    await AuditLog.create(
      [
        {
          actorType: 'ADMIN',
          actorId: admin._id,
          actorEmail: admin.email,
          action: 'REFUND_APPROVED',
          module: 'refund-management',
          targetType: 'RefundRequest',
          targetId: String(refund._id),
          reason: adminRemarks || `Approved with outcome ${leadOutcome}`,
          afterState: { refundablePoints: refund.refundablePoints, leadOutcome, walletTxId: transaction._id },
          ipAddress,
        },
      ],
      { session }
    );

    await Notification.create(
      [
        {
          recipientType: 'USER',
          recipientId: refund.userId,
          title: 'Refund Approved & Credited',
          message: `${refund.refundablePoints} claim points have been credited to your wallet for refund ${refund.refundCode}.`,
          type: 'REFUND',
          metadata: { refundId: refund._id, transactionId: transaction._id },
        },
      ],
      { session }
    );

    return { refund, transaction };
  });
}

/**
 * Admin rejects a refund — restores Claim & Lead out of REVIEW_HOLD.
 */
export async function rejectRefundAtomically({ refundId, admin, adminRemarks, ipAddress = '' }) {
  return withTransaction(async (session) => {
    const refund = await RefundRequest.findOneAndUpdate(
      {
        _id: refundId,
        status: { $in: [RefundStatus.SUBMITTED, RefundStatus.UNDER_REVIEW, RefundStatus.ADDITIONAL_INFO_REQUIRED] },
      },
      {
        $set: {
          status: RefundStatus.REJECTED,
          adminRemarks,
          reviewedByAdminId: admin._id,
          reviewedAt: new Date(),
        },
      },
      { new: true, session }
    );
    if (!refund) throw new ConflictError('Refund request not found or already finalized', 'REFUND_ALREADY_PROCESSED');

    const claim = await Claim.findById(refund.claimId).session(session);
    if (claim) {
      claim.refundHoldActive = false;
      claim.status = claim.extensionCount > 0 ? ClaimStatus.EXTENDED : ClaimStatus.ACTIVE;
      await claim.save({ session });
    }

    await Lead.findByIdAndUpdate(
      refund.leadId,
      { $set: { poolState: LeadPoolState.CLAIMED } },
      { session }
    );

    await AuditLog.create(
      [
        {
          actorType: 'ADMIN',
          actorId: admin._id,
          actorEmail: admin.email,
          action: 'REFUND_REJECTED',
          module: 'refund-management',
          targetType: 'RefundRequest',
          targetId: String(refund._id),
          reason: adminRemarks,
          ipAddress,
        },
      ],
      { session }
    );

    await Notification.create(
      [
        {
          recipientType: 'USER',
          recipientId: refund.userId,
          title: 'Refund Request Rejected',
          message: `Refund ${refund.refundCode} was rejected. Remark: ${adminRemarks || 'See refund details.'}`,
          type: 'REFUND',
          metadata: { refundId: refund._id },
        },
      ],
      { session }
    );

    return refund;
  });
}
