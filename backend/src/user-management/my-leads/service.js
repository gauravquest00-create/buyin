import { Claim } from '../../shared/models/Claim.model.js';
import { Lead } from '../../shared/models/Lead.model.js';
import { LeadStatusHistory } from '../../shared/models/LeadStatusHistory.model.js';
import { FollowUp } from '../../shared/models/FollowUp.model.js';
import { SiteVisit } from '../../shared/models/SiteVisit.model.js';
import { serializeLeadUnlocked } from '../../logics/lead/lead.logic.js';
import { ClaimStatus, LeadPoolState, LeadStatus, SiteVisitStatus } from '../../shared/enums/index.js';
import { ForbiddenError, NotFoundError } from '../../shared/errors/AppError.js';

export async function listMyLeads(userId, { status, claimStatus } = {}) {
  const claimFilter = { userId };
  if (claimStatus) claimFilter.status = claimStatus;

  const claims = await Claim.find(claimFilter).populate('leadId').sort({ createdAt: -1 }).lean();
  const now = Date.now();

  const items = claims
    .filter((c) => c.leadId)
    .filter((c) => (!status ? true : c.leadId.currentLeadStatus === status))
    .map((c) => {
      const isOwned = [ClaimStatus.ACTIVE, ClaimStatus.EXTENDED, ClaimStatus.REFUND_HOLD].includes(c.status);
      const msLeft = Math.max(0, new Date(c.expiresAt).getTime() - now);
      return {
        claim: {
          _id: c._id,
          claimCode: c.claimCode,
          status: c.status,
          claimedAt: c.claimedAt,
          expiresAt: c.expiresAt,
          daysRemaining: Math.ceil(msLeft / (1000 * 60 * 60 * 24)),
          originalClaimPoints: c.originalClaimPoints,
          extensionCount: c.extensionCount,
          extensionPointsPaid: c.extensionPointsPaid,
          refundHoldActive: c.refundHoldActive,
        },
        lead: isOwned
          ? serializeLeadUnlocked(c.leadId)
          : { ...c.leadId, buyerPhone: '[LOCKED]', buyerEmail: '[LOCKED]', contactLocked: true },
      };
    });

  return items;
}

export async function getMyLeadDetail(userId, claimId) {
  const claim = await Claim.findOne({ _id: claimId, userId }).populate('leadId').lean();
  if (!claim || !claim.leadId) throw new NotFoundError('Claimed lead not found');

  const [statusHistory, followUps, siteVisits] = await Promise.all([
    LeadStatusHistory.find({ claimId: claim._id }).sort({ createdAt: -1 }).lean(),
    FollowUp.find({ claimId: claim._id }).sort({ createdAt: -1 }).lean(),
    SiteVisit.find({ claimId: claim._id }).sort({ scheduledAt: -1 }).lean(),
  ]);

  const isOwned = [ClaimStatus.ACTIVE, ClaimStatus.EXTENDED, ClaimStatus.REFUND_HOLD].includes(claim.status);
  return {
    claim,
    lead: isOwned ? serializeLeadUnlocked(claim.leadId) : { ...claim.leadId, buyerPhone: '[LOCKED]', contactLocked: true },
    statusHistory,
    followUps,
    siteVisits,
  };
}

export async function updateLeadStatus(userId, claimId, { status, remark }) {
  const claim = await Claim.findOne({ _id: claimId, userId });
  if (!claim) throw new NotFoundError('Claim not found');
  if (![ClaimStatus.ACTIVE, ClaimStatus.EXTENDED].includes(claim.status)) {
    throw new ForbiddenError('Cannot update status on an inactive or refund-held claim');
  }

  const lead = await Lead.findById(claim.leadId);
  if (!lead) throw new NotFoundError('Lead not found');

  const previousStatus = lead.currentLeadStatus;
  lead.currentLeadStatus = status;
  if (remark) lead.lastRemarkSummary = remark;

  if (status === LeadStatus.CLOSED) {
    lead.poolState = LeadPoolState.CLOSED;
    lead.isPermanentlyClosed = true;
    lead.closureReason = 'Deal closed by professional';
    claim.status = ClaimStatus.CLOSED;
    claim.closedAt = new Date();
    await claim.save();
  }
  await lead.save();

  const entry = await LeadStatusHistory.create({
    leadId: lead._id,
    claimId: claim._id,
    userId,
    previousStatus,
    newStatus: status,
    remark,
  });

  return { lead: serializeLeadUnlocked(lead), historyEntry: entry };
}

export async function addFollowUp(userId, claimId, payload) {
  const claim = await Claim.findOne({ _id: claimId, userId });
  if (!claim) throw new NotFoundError('Claim not found');

  const followUp = await FollowUp.create({
    leadId: claim.leadId,
    claimId: claim._id,
    userId,
    note: payload.note,
    nextFollowUpAt: payload.nextFollowUpAt ? new Date(payload.nextFollowUpAt) : null,
    channel: payload.channel,
  });

  await Lead.findByIdAndUpdate(claim.leadId, {
    $set: { lastRemarkSummary: payload.note.slice(0, 240), lastFollowUpAt: new Date() },
  });

  return followUp;
}

export async function scheduleSiteVisit(userId, claimId, payload) {
  const claim = await Claim.findOne({ _id: claimId, userId });
  if (!claim) throw new NotFoundError('Claim not found');

  const visit = await SiteVisit.create({
    leadId: claim.leadId,
    claimId: claim._id,
    userId,
    scheduledAt: new Date(payload.scheduledAt),
    propertyAddress: payload.propertyAddress,
    notes: payload.notes || '',
  });

  await Lead.findByIdAndUpdate(claim.leadId, {
    $set: { currentLeadStatus: LeadStatus.SITE_VISIT_SCHEDULED, siteVisitStatus: SiteVisitStatus.SCHEDULED },
  });

  return visit;
}

export async function updateSiteVisit(userId, visitId, payload) {
  const visit = await SiteVisit.findOne({ _id: visitId, userId });
  if (!visit) throw new NotFoundError('Site visit not found');
  visit.status = payload.status;
  if (payload.notes !== undefined) visit.notes = payload.notes;
  await visit.save();

  if (payload.status === 'COMPLETED') {
    await Lead.findByIdAndUpdate(visit.leadId, { $set: { currentLeadStatus: LeadStatus.SITE_VISITED } });
  }
  return visit;
}
