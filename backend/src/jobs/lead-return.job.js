import { Lead } from '../shared/models/Lead.model.js';
import { Claim } from '../shared/models/Claim.model.js';
import { ClaimStatus, LeadPoolState } from '../shared/enums/index.js';
import { isLeadEligibleForPoolReturn } from '../logics/lead/lead.logic.js';
import { logger } from '../shared/utils/logger.js';

/**
 * Ensures any orphaned expired leads (whose claims are EXPIRED) return cleanly to the pool.
 */
export async function runLeadReturnJob() {
  const candidates = await Lead.find({
    poolState: LeadPoolState.CLAIMED,
    ownershipExpiresAt: { $lte: new Date() },
  });

  let returned = 0;
  for (const lead of candidates) {
    const activeHold = await Claim.findOne({
      leadId: lead._id,
      status: { $in: [ClaimStatus.ACTIVE, ClaimStatus.EXTENDED, ClaimStatus.REFUND_HOLD] },
      $or: [{ refundHoldActive: true }, { expiresAt: { $gt: new Date() } }],
    }).lean();

    if (activeHold) continue;
    if (!isLeadEligibleForPoolReturn(lead)) continue;

    lead.poolState = LeadPoolState.AVAILABLE;
    lead.activeClaimId = null;
    lead.activeOwnerId = null;
    lead.ownershipExpiresAt = null;
    lead.isReturnedLead = true;
    lead.returnCount = (lead.returnCount || 0) + 1;
    await lead.save();
    returned++;
  }

  logger.info('Lead return sweep completed', { checked: candidates.length, returned });
  return { checked: candidates.length, returned };
}
