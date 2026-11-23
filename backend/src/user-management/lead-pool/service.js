import { Lead } from '../../shared/models/Lead.model.js';
import { Claim } from '../../shared/models/Claim.model.js';
import { SiteVisit } from '../../shared/models/SiteVisit.model.js';
import { FollowUp } from '../../shared/models/FollowUp.model.js';
import { LeadPoolState, LeadStatus, SiteVisitStatus, ClaimStatus } from '../../shared/enums/index.js';
import { serializeLeadForPool } from '../../logics/lead/lead.logic.js';
import { ensureWallet } from '../../logics/wallet/wallet.logic.js';
import { canUserClaimLeads } from '../../logics/user/user.logic.js';
import { buildPaginationMeta } from '../../shared/responses/apiResponse.js';
import { NotFoundError } from '../../shared/errors/AppError.js';

export async function browseLeadPool(user, query) {
  const filter = { poolState: LeadPoolState.AVAILABLE };

  if (query.city) filter.city = new RegExp(query.city, 'i');
  if (query.location) filter.location = new RegExp(query.location, 'i');
  if (query.budgetBand) filter.budgetBand = query.budgetBand;
  if (query.propertyType) filter.propertyType = query.propertyType;

  if (query.poolFilter === 'FRESH') filter.isReturnedLead = false;
  else if (query.poolFilter === 'RETURNED') filter.isReturnedLead = true;
  else if (query.poolFilter === 'VISITED') {
    filter.siteVisitStatus = { $in: [SiteVisitStatus.COMPLETED_VERIFIED, SiteVisitStatus.MULTIPLE_VERIFIED] };
  }

  if (query.search) {
    const rx = new RegExp(query.search, 'i');
    filter.$or = [{ title: rx }, { requirementSummary: rx }, { location: rx }, { city: rx }, { leadCode: rx }];
  }

  const page = query.page || 1;
  const limit = query.limit || 20;
  const skip = (page - 1) * limit;

  const [leads, total, wallet] = await Promise.all([
    Lead.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Lead.countDocuments(filter),
    ensureWallet(user._id),
  ]);

  const claimEligibility = canUserClaimLeads(user);

  return {
    items: leads.map(serializeLeadForPool),
    walletBalancePoints: wallet.balancePoints,
    claimEligibility,
    meta: buildPaginationMeta(page, limit, total),
  };
}

export async function getPoolLeadDetail(user, leadId) {
  const lead = await Lead.findOne({ _id: leadId, poolState: LeadPoolState.AVAILABLE }).lean();
  if (!lead) throw new NotFoundError('Buyer requirement is no longer available in the pool', 'LEAD_NOT_AVAILABLE');

  const wallet = await ensureWallet(user._id);
  const masked = serializeLeadForPool(lead);
  return {
    lead: masked,
    claimPreview: {
      claimPoints: masked.computedClaimPoints,
      currentBalance: wallet.balancePoints,
      remainingBalance: wallet.balancePoints - masked.computedClaimPoints,
      hasSufficientBalance: wallet.balancePoints >= masked.computedClaimPoints,
      ownershipDays: 20,
      claimEligibility: canUserClaimLeads(user),
    },
  };
}

export async function getDashboardSummary(user) {
  const userId = user._id;
  const [
    availableLeadsCount,
    myActiveLeadsCount,
    siteVisitsCount,
    closedDealsCount,
    wallet,
    recentPoolLeads,
    recentClaims,
    upcomingFollowUps,
  ] = await Promise.all([
    Lead.countDocuments({ poolState: LeadPoolState.AVAILABLE }),
    Claim.countDocuments({ userId, status: { $in: [ClaimStatus.ACTIVE, ClaimStatus.EXTENDED, ClaimStatus.REFUND_HOLD] } }),
    SiteVisit.countDocuments({ userId }),
    Lead.countDocuments({ activeOwnerId: userId, currentLeadStatus: LeadStatus.CLOSED }),
    ensureWallet(userId),
    Lead.find({ poolState: LeadPoolState.AVAILABLE }).sort({ createdAt: -1 }).limit(5).lean(),
    Claim.find({ userId }).populate('leadId', 'leadCode title city location currentLeadStatus').sort({ updatedAt: -1 }).limit(5).lean(),
    FollowUp.find({ userId, nextFollowUpAt: { $gte: new Date() } })
      .populate('leadId', 'leadCode title location')
      .sort({ nextFollowUpAt: 1 })
      .limit(5)
      .lean(),
  ]);

  return {
    kpis: {
      availableLeads: availableLeadsCount,
      myActiveLeads: myActiveLeadsCount,
      siteVisits: siteVisitsCount,
      closedDeals: closedDealsCount,
      walletBalancePoints: wallet.balancePoints,
    },
    recentlyAddedLeads: recentPoolLeads.map(serializeLeadForPool),
    recentLeadActivity: recentClaims,
    upcomingFollowUps,
    claimEligibility: canUserClaimLeads(user),
  };
}
