import { LeadPoolState, LeadStatus } from '../../shared/enums/index.js';

export function maskPhone(phone = '') {
  const clean = String(phone).replace(/\s+/g, '');
  if (clean.length < 4) return '**********';
  return `${clean.slice(0, 2)}******${clean.slice(-2)}`;
}

export function maskEmail(email = '') {
  if (!email || !email.includes('@')) return 'hidden@buyin.locked';
  const [local, domain] = email.split('@');
  const prefix = local.slice(0, 2);
  return `${prefix}***@${domain}`;
}

/**
 * Masks private buyer PII for browsing in the Lead Pool before claiming.
 */
export function serializeLeadForPool(leadDoc) {
  const lead = leadDoc?.toObject ? leadDoc.toObject() : { ...leadDoc };
  return {
    _id: lead._id,
    leadCode: lead.leadCode,
    title: lead.title,
    requirementSummary: lead.requirementSummary,
    budgetBand: lead.budgetBand,
    budgetMinInr: lead.budgetMinInr,
    budgetMaxInr: lead.budgetMaxInr,
    propertyType: lead.propertyType,
    city: lead.city,
    location: lead.location,
    configuration: lead.configuration,
    purchaseTimeline: lead.purchaseTimeline,
    seriousnessScore: lead.seriousnessScore,
    signals: lead.signals,
    siteVisitStatus: lead.siteVisitStatus,
    verifiedVisitsCount: lead.verifiedVisitsCount,
    poolState: lead.poolState,
    isReturnedLead: lead.isReturnedLead,
    returnCount: lead.returnCount,
    lastRemarkSummary: lead.lastRemarkSummary,
    computedClaimPoints: lead.computedClaimPoints,
    pricingSnapshot: lead.pricingSnapshot,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
    // Strictly masked buyer details
    contactLocked: true,
    buyerPreview: {
      name: 'Locked Buyer',
      phone: maskPhone(lead.buyerPhone),
      email: maskEmail(lead.buyerEmail),
    },
  };
}

/**
 * Full unlocked view ONLY for the verified active owner of the lead or an authorized Admin.
 */
export function serializeLeadUnlocked(leadDoc) {
  const lead = leadDoc?.toObject ? leadDoc.toObject() : { ...leadDoc };
  return {
    ...lead,
    contactLocked: false,
    buyerContact: {
      name: lead.buyerName,
      phone: lead.buyerPhone,
      alternatePhone: lead.buyerAlternatePhone || '',
      email: lead.buyerEmail || '',
      notes: lead.buyerNotes || '',
    },
  };
}

const NON_RETURNABLE_STATUSES = new Set([
  LeadStatus.CLOSED,
  LeadStatus.CANCELLED,
]);

const NON_RETURNABLE_POOL_STATES = new Set([
  LeadPoolState.CLOSED,
  LeadPoolState.LEAD_BIN,
  LeadPoolState.ARCHIVED,
  LeadPoolState.REVIEW_HOLD,
]);

export function isLeadEligibleForPoolReturn(lead) {
  if (!lead) return false;
  if (lead.isPermanentlyClosed) return false;
  if (NON_RETURNABLE_POOL_STATES.has(lead.poolState)) return false;
  if (NON_RETURNABLE_STATUSES.has(lead.currentLeadStatus)) return false;
  return true;
}
