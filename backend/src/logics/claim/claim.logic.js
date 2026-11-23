import { withTransaction } from '../../config/database.js';
import { BUSINESS_RULES } from '../../shared/constants/index.js';
import { ClaimStatus, LeadPoolState, LeadStatus, WalletTxType } from '../../shared/enums/index.js';
import { Lead } from '../../shared/models/Lead.model.js';
import { Claim } from '../../shared/models/Claim.model.js';
import { LeadStatusHistory } from '../../shared/models/LeadStatusHistory.model.js';
import { Notification } from '../../shared/models/Notification.model.js';
import { PricingRule } from '../../shared/models/PricingRule.model.js';
import { calculateClaimPricing } from '../pricing/pricing.engine.js';
import { debitWalletPoints } from '../wallet/wallet.logic.js';
import { isLeadEligibleForPoolReturn, serializeLeadUnlocked } from '../lead/lead.logic.js';
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from '../../shared/errors/AppError.js';
import { generateCode } from '../../shared/utils/crypto.js';

export function calculateExtensionCost(originalClaimPoints) {
  return Math.max(1, Math.round(Number(originalClaimPoints) * BUSINESS_RULES.EXTENSION_COST_RATIO));
}

export function addDays(date, days) {
  return new Date(new Date(date).getTime() + days * 24 * 60 * 60 * 1000);
}

/**
 * Atomically claims an available buyer requirement for a verified professional.
 * Guarantees only ONE active owner per lead via conditional update + MongoDB transaction
 * + partial unique index on Claim({ leadId }).
 */
export async function claimLeadAtomically({ userId, leadId, idempotencyKey }) {
  return withTransaction(async (session) => {
    const activePricingRule = await PricingRule.findOne({ isActive: true }).sort({ version: -1 }).session(session).lean();

    const lead = await Lead.findById(leadId).session(session);
    if (!lead) throw new NotFoundError('Buyer requirement not found', 'LEAD_NOT_FOUND');
    if (lead.poolState !== LeadPoolState.AVAILABLE || lead.activeClaimId) {
      throw new ConflictError('This buyer requirement has already been claimed or is unavailable', 'LEAD_NOT_AVAILABLE');
    }

    const pricingSnapshot = calculateClaimPricing(lead, activePricingRule || undefined);
    const claimPoints = pricingSnapshot.finalPoints;
    const now = new Date();
    const expiresAt = addDays(now, BUSINESS_RULES.OWNERSHIP_DAYS);

    // 1. Conditional atomic lock on Lead BEFORE debiting wallet so failed claims never deduct points
    const lockedLead = await Lead.findOneAndUpdate(
      { _id: lead._id, poolState: LeadPoolState.AVAILABLE, activeClaimId: null },
      {
        $set: {
          poolState: LeadPoolState.CLAIMED,
          currentLeadStatus: LeadStatus.CLAIMED,
          activeOwnerId: userId,
          ownershipExpiresAt: expiresAt,
          computedClaimPoints: claimPoints,
          pricingSnapshot,
        },
      },
      { new: true, session }
    );

    if (!lockedLead) {
      throw new ConflictError('Lead was just claimed by another professional', 'CONCURRENT_CLAIM_CONFLICT');
    }

    // 2. Atomic wallet deduction with immutable ledger
    const debitKey = idempotencyKey || `claim:${lead._id}:${userId}:${Date.now()}`;
    const { wallet, transaction } = await debitWalletPoints({
      userId,
      points: claimPoints,
      type: WalletTxType.CLAIM_DEDUCTION,
      reason: `Claimed buyer requirement ${lead.leadCode} (${BUSINESS_RULES.OWNERSHIP_DAYS} days ownership)`,
      idempotencyKey: debitKey,
      referenceType: 'CLAIM',
      referenceId: lead._id,
      metadata: { leadCode: lead.leadCode, pricingSnapshot },
      session,
    });

    // 3. Create Claim with immutable pricing snapshot
    const [claim] = await Claim.create(
      [
        {
          claimCode: generateCode('CLM'),
          leadId: lead._id,
          userId,
          status: ClaimStatus.ACTIVE,
          claimedAt: now,
          originalExpiresAt: expiresAt,
          expiresAt,
          originalClaimPoints: claimPoints,
          pricingSnapshot,
          claimTransactionId: transaction._id,
        },
      ],
      { session }
    );

    lockedLead.activeClaimId = claim._id;
    await lockedLead.save({ session });

    await LeadStatusHistory.create(
      [
        {
          leadId: lead._id,
          claimId: claim._id,
          userId,
          previousStatus: null,
          newStatus: LeadStatus.CLAIMED,
          remark: 'Buyer requirement claimed from pool',
        },
      ],
      { session }
    );

    await Notification.create(
      [
        {
          recipientType: 'USER',
          recipientId: userId,
          title: 'Lead Claimed Successfully',
          message: `You claimed ${lead.leadCode} for ${claimPoints} points. Buyer contact details are now unlocked for ${BUSINESS_RULES.OWNERSHIP_DAYS} days.`,
          type: 'CLAIM',
          metadata: { leadId: lead._id, claimId: claim._id },
        },
      ],
      { session }
    );

    return {
      claim,
      lead: serializeLeadUnlocked(lockedLead),
      walletBalancePoints: wallet.balancePoints,
      transaction,
    };
  });
}

/**
 * Extends active claim ownership by 7 days at 25% of original claim points.
 * Prevents duplicate extension charges.
 */
export async function extendClaimOwnership({ userId, claimId }) {
  return withTransaction(async (session) => {
    const claim = await Claim.findOne({ _id: claimId, userId }).session(session);
    if (!claim) throw new NotFoundError('Claim not found', 'CLAIM_NOT_FOUND');

    if (claim.refundHoldActive || claim.status === ClaimStatus.REFUND_HOLD) {
      throw new ConflictError('Cannot extend a claim while a refund request is under review', 'REFUND_HOLD_ACTIVE');
    }
    if (claim.status !== ClaimStatus.ACTIVE) {
      throw new ValidationError(`Claim in status ${claim.status} cannot be extended`);
    }
    if (claim.extensionCount >= BUSINESS_RULES.MAX_EXTENSIONS_PER_CLAIM) {
      throw new ConflictError('Ownership extension has already been applied to this claim', 'ALREADY_EXTENDED');
    }
    if (new Date(claim.expiresAt) <= new Date()) {
      throw new ValidationError('Claim ownership has already expired');
    }

    const extensionCost = calculateExtensionCost(claim.originalClaimPoints);
    const newExpiresAt = addDays(claim.expiresAt, BUSINESS_RULES.EXTENSION_DAYS);

    const { wallet, transaction } = await debitWalletPoints({
      userId,
      points: extensionCost,
      type: WalletTxType.EXTENSION_DEDUCTION,
      reason: `7-day ownership extension for claim ${claim.claimCode} (25% of ${claim.originalClaimPoints} pts)`,
      idempotencyKey: `extension:${claim._id}:1`,
      referenceType: 'EXTENSION',
      referenceId: claim._id,
      metadata: { originalClaimPoints: claim.originalClaimPoints, extensionCost },
      session,
    });

    claim.status = ClaimStatus.EXTENDED;
    claim.extensionCount += 1;
    claim.extensionPointsPaid = extensionCost;
    claim.extendedAt = new Date();
    claim.expiresAt = newExpiresAt;
    claim.extensionTransactionId = transaction._id;
    await claim.save({ session });

    await Lead.findByIdAndUpdate(
      claim.leadId,
      { $set: { ownershipExpiresAt: newExpiresAt } },
      { session }
    );

    await Notification.create(
      [
        {
          recipientType: 'USER',
          recipientId: userId,
          title: 'Ownership Extended by 7 Days',
          message: `Claim ${claim.claimCode} extended until ${newExpiresAt.toISOString().slice(0, 10)} for ${extensionCost} points.`,
          type: 'EXTENSION',
          metadata: { claimId: claim._id, leadId: claim.leadId },
        },
      ],
      { session }
    );

    return { claim, walletBalancePoints: wallet.balancePoints, transaction };
  });
}

/**
 * Expires overdue active/extended claims (skipping claims protected by refund hold or closed).
 * Returns eligible leads to the shared pool preserving history, remarks, and site visits.
 */
export async function processExpiredClaimsAndReturnLeads(now = new Date()) {
  const overdueClaims = await Claim.find({
    status: { $in: [ClaimStatus.ACTIVE, ClaimStatus.EXTENDED] },
    refundHoldActive: false,
    expiresAt: { $lte: now },
  }).lean();

  let expiredCount = 0;
  let returnedToPoolCount = 0;

  for (const c of overdueClaims) {
    await withTransaction(async (session) => {
      const claim = await Claim.findOneAndUpdate(
        {
          _id: c._id,
          status: { $in: [ClaimStatus.ACTIVE, ClaimStatus.EXTENDED] },
          refundHoldActive: false,
        },
        { $set: { status: ClaimStatus.EXPIRED } },
        { new: true, session }
      );
      if (!claim) return;
      expiredCount++;

      const lead = await Lead.findById(claim.leadId).session(session);
      if (!lead) return;

      if (isLeadEligibleForPoolReturn(lead)) {
        lead.poolState = LeadPoolState.AVAILABLE;
        lead.activeClaimId = null;
        lead.activeOwnerId = null;
        lead.ownershipExpiresAt = null;
        lead.isReturnedLead = true;
        lead.returnCount = (lead.returnCount || 0) + 1;
        await lead.save({ session });
        returnedToPoolCount++;

        await Notification.create(
          [
            {
              recipientType: 'USER',
              recipientId: claim.userId,
              title: 'Lead Ownership Expired',
              message: `Ownership for ${lead.leadCode} expired and the requirement returned to the BUYIN pool.`,
              type: 'EXPIRY',
              metadata: { claimId: claim._id, leadId: lead._id },
            },
          ],
          { session }
        );
      } else {
        lead.activeClaimId = null;
        lead.activeOwnerId = null;
        lead.ownershipExpiresAt = null;
        await lead.save({ session });
      }
    });
  }

  return { checked: overdueClaims.length, expiredCount, returnedToPoolCount };
}
