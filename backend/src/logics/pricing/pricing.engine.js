import { DEFAULT_PRICING_CONFIG } from '../../shared/constants/index.js';
import { SiteVisitStatus } from '../../shared/enums/index.js';

/**
 * Pure, deterministic pricing calculator for BUYIN buyer requirements.
 * Produces an immutable pricing snapshot stored on both the Lead and every Claim.
 */
export function calculateClaimPricing(leadInput, pricingConfig = DEFAULT_PRICING_CONFIG) {
  const cfg = {
    budgetBasePoints: pricingConfig?.budgetBasePoints || DEFAULT_PRICING_CONFIG.budgetBasePoints,
    propertyTypeAdditions: pricingConfig?.propertyTypeAdditions || DEFAULT_PRICING_CONFIG.propertyTypeAdditions,
    buyerSignals: pricingConfig?.buyerSignals || DEFAULT_PRICING_CONFIG.buyerSignals,
    siteVisitPremiums: pricingConfig?.siteVisitPremiums || DEFAULT_PRICING_CONFIG.siteVisitPremiums,
    returnedLeadDiscounts: pricingConfig?.returnedLeadDiscounts || DEFAULT_PRICING_CONFIG.returnedLeadDiscounts,
  };

  const basePoints = Number(cfg.budgetBasePoints[leadInput.budgetBand] ?? 180);
  const propertyAddition = Number(cfg.propertyTypeAdditions[leadInput.propertyType] ?? 0);

  const signals = leadInput.signals || {};
  const signalBreakdown = {};
  let signalTotal = 0;

  if (signals.contactVerified) {
    signalBreakdown.contactVerified = Number(cfg.buyerSignals.contactVerified || 0);
    signalTotal += signalBreakdown.contactVerified;
  }
  if (signals.budgetConfirmed) {
    signalBreakdown.budgetConfirmed = Number(cfg.buyerSignals.budgetConfirmed || 0);
    signalTotal += signalBreakdown.budgetConfirmed;
  }
  if (signals.exactLocationConfig) {
    signalBreakdown.exactLocationConfig = Number(cfg.buyerSignals.exactLocationConfig || 0);
    signalTotal += signalBreakdown.exactLocationConfig;
  }
  if (leadInput.purchaseTimeline === 'WITHIN_30_DAYS') {
    signalBreakdown.purchaseWithin30Days = Number(cfg.buyerSignals.purchaseWithin30Days || 0);
    signalTotal += signalBreakdown.purchaseWithin30Days;
  } else if (leadInput.purchaseTimeline === 'DAYS_31_TO_90') {
    signalBreakdown.purchaseWithin31To90Days = Number(cfg.buyerSignals.purchaseWithin31To90Days || 0);
    signalTotal += signalBreakdown.purchaseWithin31To90Days;
  }
  if (signals.siteVisitRequested) {
    signalBreakdown.siteVisitRequested = Number(cfg.buyerSignals.siteVisitRequested || 0);
    signalTotal += signalBreakdown.siteVisitRequested;
  }
  if (signals.buyerActivelyResponding) {
    signalBreakdown.buyerActivelyResponding = Number(cfg.buyerSignals.buyerActivelyResponding || 0);
    signalTotal += signalBreakdown.buyerActivelyResponding;
  }
  if (signals.fundingLoanReadiness) {
    signalBreakdown.fundingLoanReadiness = Number(cfg.buyerSignals.fundingLoanReadiness || 0);
    signalTotal += signalBreakdown.fundingLoanReadiness;
  }

  let siteVisitPremium = 0;
  if (leadInput.siteVisitStatus === SiteVisitStatus.MULTIPLE_VERIFIED || (leadInput.verifiedVisitsCount || 0) >= 2) {
    siteVisitPremium = Number(cfg.siteVisitPremiums.multipleVerified || 0);
  } else if (leadInput.siteVisitStatus === SiteVisitStatus.COMPLETED_VERIFIED || (leadInput.verifiedVisitsCount || 0) === 1) {
    siteVisitPremium = Number(cfg.siteVisitPremiums.completedVerified || 0);
  } else if (leadInput.siteVisitStatus === SiteVisitStatus.SCHEDULED) {
    siteVisitPremium = Number(cfg.siteVisitPremiums.scheduled || 0);
  }

  const grossPoints = basePoints + propertyAddition + signalTotal + siteVisitPremium;

  // Returned lead discount — only applied if returned AND approved (never unapproved!)
  let discountPercent = 0;
  let discountReason = null;
  if (leadInput.isReturnedLead) {
    const requireApproval = cfg.returnedLeadDiscounts.applyOnlyWhenApproved !== false;
    const isApproved = !requireApproval || Boolean(leadInput.returnedDiscountApproved);
    if (isApproved) {
      const staleDays = Number(cfg.returnedLeadDiscounts.staleFollowUpDays || 10);
      const lastFollowUp = leadInput.lastFollowUpAt ? new Date(leadInput.lastFollowUpAt) : null;
      const daysSinceFollowUp = lastFollowUp
        ? (Date.now() - lastFollowUp.getTime()) / (1000 * 60 * 60 * 24)
        : null;

      if (daysSinceFollowUp !== null && daysSinceFollowUp < staleDays) {
        discountPercent = Number(cfg.returnedLeadDiscounts.recentFollowUpDiscountPercent || 0);
        discountReason = discountPercent > 0 ? 'RECENT_FOLLOW_UP' : 'RECENT_FOLLOW_UP_NO_DISCOUNT';
      } else if (daysSinceFollowUp !== null && daysSinceFollowUp >= staleDays) {
        discountPercent = Number(cfg.returnedLeadDiscounts.staleFollowUpDiscountPercent || 15);
        discountReason = 'STALE_FOLLOW_UP';
      } else if ((leadInput.returnCount || 1) >= 1) {
        discountPercent = Number(cfg.returnedLeadDiscounts.firstReturnDiscountPercent || 10);
        discountReason = 'FIRST_RETURN';
      }
    }
  }

  const discountPoints = Math.round((grossPoints * discountPercent) / 100);
  const finalPoints = Math.max(1, grossPoints - discountPoints);

  return {
    basePoints,
    propertyAddition,
    signalBreakdown,
    signalTotal,
    siteVisitPremium,
    grossPoints,
    discountPercent,
    discountPoints,
    discountReason,
    finalPoints,
    calculatedAt: new Date().toISOString(),
  };
}
