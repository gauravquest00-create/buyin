import { Claim } from '../../shared/models/Claim.model.js';
import { Lead } from '../../shared/models/Lead.model.js';
import { Notification } from '../../shared/models/Notification.model.js';
import { ClaimStatus, LeadPoolState } from '../../shared/enums/index.js';
import { NotFoundError } from '../../shared/errors/AppError.js';
import { recordAdminAudit } from '../_helpers/audit.helper.js';

export async function listClaims(query) {
  const filter = {};
  if (query.status) filter.status = query.status;
  return Claim.find(filter)
    .populate('userId', 'fullName email mobile agencyName')
    .populate('leadId', 'leadCode title city location currentLeadStatus')
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
}

export async function revokeClaimManually(claimId, { reason, returnLeadToPool }, admin, ipAddress) {
  const claim = await Claim.findById(claimId);
  if (!claim) throw new NotFoundError('Claim not found');

  claim.status = ClaimStatus.REVOKED;
  claim.refundHoldActive = false;
  claim.revokedAt = new Date();
  claim.revocationReason = reason;
  claim.revokedByAdminId = admin._id;
  await claim.save();

  await Lead.findByIdAndUpdate(claim.leadId, {
    $set: {
      poolState: returnLeadToPool ? LeadPoolState.AVAILABLE : LeadPoolState.ARCHIVED,
      activeClaimId: null,
      activeOwnerId: null,
      ownershipExpiresAt: null,
      isReturnedLead: returnLeadToPool,
    },
  });

  await Notification.create({
    recipientType: 'USER',
    recipientId: claim.userId,
    title: 'Lead Ownership Revoked',
    message: `Ownership for claim ${claim.claimCode} was revoked by BUYIN Administration. Reason: ${reason}`,
    type: 'CLAIM',
    metadata: { claimId: claim._id },
  });

  await recordAdminAudit({
    admin,
    action: 'CLAIM_REVOKED_MANUALLY',
    module: 'claim-management',
    targetType: 'Claim',
    targetId: claim._id,
    reason,
    afterState: { returnLeadToPool },
    ipAddress,
  });

  return claim;
}
