import { Lead } from '../../shared/models/Lead.model.js';
import { Claim } from '../../shared/models/Claim.model.js';
import { LeadStatusHistory } from '../../shared/models/LeadStatusHistory.model.js';
import { FollowUp } from '../../shared/models/FollowUp.model.js';
import { SiteVisit } from '../../shared/models/SiteVisit.model.js';
import { PricingRule } from '../../shared/models/PricingRule.model.js';
import { calculateClaimPricing } from '../../logics/pricing/pricing.engine.js';
import { LeadPoolState, LeadStatus } from '../../shared/enums/index.js';
import { generateCode } from '../../shared/utils/crypto.js';
import { buildPaginationMeta } from '../../shared/responses/apiResponse.js';
import { NotFoundError } from '../../shared/errors/AppError.js';
import { recordAdminAudit } from '../_helpers/audit.helper.js';

export async function listLeads(query) {
  const filter = {};
  if (query.poolState) filter.poolState = query.poolState;
  if (query.currentLeadStatus) filter.currentLeadStatus = query.currentLeadStatus;
  if (query.city) filter.city = new RegExp(query.city, 'i');
  if (query.isReturnedLead === 'true') filter.isReturnedLead = true;
  if (query.search) {
    const rx = new RegExp(query.search, 'i');
    filter.$or = [{ leadCode: rx }, { title: rx }, { buyerName: rx }, { buyerPhone: rx }, { location: rx }, { city: rx }];
  }
  const page = Number(query.page) || 1;
  const limit = Math.min(100, Number(query.limit) || 25);
  const [leads, total] = await Promise.all([
    Lead.find(filter)
      .populate('activeOwnerId', 'fullName email mobile')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Lead.countDocuments(filter),
  ]);
  return { leads, meta: buildPaginationMeta(page, limit, total) };
}

export async function getLeadDetail(leadId) {
  const lead = await Lead.findById(leadId)
    .populate('activeOwnerId', 'fullName email mobile agencyName')
    .populate('activeClaimId', 'claimCode status claimedAt expiresAt originalClaimPoints extensionCount')
    .lean();
  if (!lead) throw new NotFoundError('Lead not found', 'LEAD_NOT_FOUND');

  const [claims, statusHistory, followUps, siteVisits] = await Promise.all([
    Claim.find({ leadId }).populate('userId', 'fullName email mobile').sort({ createdAt: -1 }).lean(),
    LeadStatusHistory.find({ leadId }).populate('userId', 'fullName email').sort({ createdAt: -1 }).lean(),
    FollowUp.find({ leadId }).populate('userId', 'fullName email').sort({ createdAt: -1 }).lean(),
    SiteVisit.find({ leadId }).populate('userId', 'fullName email').sort({ scheduledAt: -1 }).lean(),
  ]);

  return { lead, claims, statusHistory, followUps, siteVisits };
}

export async function createLead(payload, admin, ipAddress) {
  const pricingRule = await PricingRule.findOne({ isActive: true }).sort({ version: -1 }).lean();
  const snapshot = calculateClaimPricing(payload, pricingRule || undefined);
  const lead = await Lead.create({
    ...payload,
    leadCode: generateCode('LED'),
    poolState: payload.publishImmediately ? LeadPoolState.AVAILABLE : LeadPoolState.DRAFT,
    computedClaimPoints: snapshot.finalPoints,
    pricingSnapshot: snapshot,
    createdByAdminId: admin._id,
  });
  await recordAdminAudit({
    admin,
    action: 'LEAD_CREATED',
    module: 'lead-management',
    targetType: 'Lead',
    targetId: lead._id,
    afterState: { leadCode: lead.leadCode, poolState: lead.poolState, points: lead.computedClaimPoints },
    ipAddress,
  });
  return lead;
}

export async function updateLead(leadId, updates, admin, ipAddress) {
  const lead = await Lead.findById(leadId);
  if (!lead) throw new NotFoundError('Lead not found', 'LEAD_NOT_FOUND');

  const beforeState = {
    poolState: lead.poolState,
    currentLeadStatus: lead.currentLeadStatus,
    computedClaimPoints: lead.computedClaimPoints,
  };

  Object.assign(lead, updates);

  if (updates.currentLeadStatus === LeadStatus.CLOSED) {
    lead.poolState = LeadPoolState.CLOSED;
    lead.isPermanentlyClosed = true;
  } else if (updates.poolState === LeadPoolState.AVAILABLE) {
    lead.isPermanentlyClosed = false;
  }

  const pricingRule = await PricingRule.findOne({ isActive: true }).sort({ version: -1 }).lean();
  const snapshot = calculateClaimPricing(lead, pricingRule || undefined);
  lead.computedClaimPoints = snapshot.finalPoints;
  lead.pricingSnapshot = snapshot;
  await lead.save();

  await recordAdminAudit({
    admin,
    action: 'LEAD_UPDATED',
    module: 'lead-management',
    targetType: 'Lead',
    targetId: lead._id,
    beforeState,
    afterState: {
      poolState: lead.poolState,
      currentLeadStatus: lead.currentLeadStatus,
      computedClaimPoints: lead.computedClaimPoints,
    },
    ipAddress,
  });
  return lead;
}

export async function publishLead(leadId, admin, ipAddress) {
  return updateLead(leadId, { poolState: LeadPoolState.AVAILABLE, isPermanentlyClosed: false }, admin, ipAddress);
}

export async function archiveLead(leadId, reason, admin, ipAddress) {
  return updateLead(
    leadId,
    { poolState: LeadPoolState.ARCHIVED, isPermanentlyClosed: true, closureReason: reason || 'Archived by admin' },
    admin,
    ipAddress
  );
}