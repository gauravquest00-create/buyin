export const UserStatus = Object.freeze({
  PENDING_OTP: 'PENDING_OTP',
  PENDING_ONBOARDING: 'PENDING_ONBOARDING',
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
  ACTIVE: 'ACTIVE',
  RESTRICTED: 'RESTRICTED',
  SUSPENDED: 'SUSPENDED',
});

export const VerificationStatus = Object.freeze({
  NOT_SUBMITTED: 'NOT_SUBMITTED',
  SUBMITTED: 'SUBMITTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  MORE_DOCS_REQUIRED: 'MORE_DOCS_REQUIRED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  SUSPENDED: 'SUSPENDED',
});

export const LeadPoolState = Object.freeze({
  DRAFT: 'DRAFT',
  AVAILABLE: 'AVAILABLE',
  CLAIMED: 'CLAIMED',
  REVIEW_HOLD: 'REVIEW_HOLD',
  CLOSED: 'CLOSED',
  LEAD_BIN: 'LEAD_BIN',
  ARCHIVED: 'ARCHIVED',
});

export const LeadStatus = Object.freeze({
  CLAIMED: 'Claimed',
  CONTACTED: 'Contacted',
  INTERESTED: 'Interested',
  FOLLOW_UP: 'Follow-up',
  SITE_VISIT_SCHEDULED: 'Site Visit Scheduled',
  SITE_VISITED: 'Site Visited',
  NEGOTIATION: 'Negotiation',
  CLOSED: 'Closed',
  LOST: 'Lost',
  CANCELLED: 'Cancelled',
});

export const ClaimStatus = Object.freeze({
  ACTIVE: 'ACTIVE',
  EXTENDED: 'EXTENDED',
  EXPIRED: 'EXPIRED',
  CLOSED: 'CLOSED',
  REFUND_HOLD: 'REFUND_HOLD',
  REFUNDED: 'REFUNDED',
  REVOKED: 'REVOKED',
});

export const BudgetBand = Object.freeze({
  BELOW_50L: 'BELOW_50L',
  L50_TO_1CR: '50L_1CR',
  CR1_TO_2CR: '1CR_2CR',
  CR2_TO_5CR: '2CR_5CR',
  CR5_TO_10CR: '5CR_10CR',
  ABOVE_10CR: '10CR_PLUS',
});

export const PropertyType = Object.freeze({
  APARTMENT: 'Apartment',
  BUILDER_FLOOR: 'Builder Floor',
  RESIDENTIAL_PLOT: 'Residential Plot',
  INDEPENDENT_HOUSE: 'Independent House',
  VILLA_LUXURY: 'Villa/Luxury',
  COMMERCIAL: 'Commercial',
});

export const SiteVisitStatus = Object.freeze({
  NONE: 'None',
  REQUESTED: 'Requested',
  SCHEDULED: 'Scheduled',
  COMPLETED_VERIFIED: 'Completed & Verified',
  MULTIPLE_VERIFIED: 'Multiple Verified Visits',
});

export const WalletTxType = Object.freeze({
  RECHARGE: 'RECHARGE',
  CLAIM_DEDUCTION: 'CLAIM_DEDUCTION',
  EXTENSION_DEDUCTION: 'EXTENSION_DEDUCTION',
  REFUND_CREDIT: 'REFUND_CREDIT',
  BONUS_CREDIT: 'BONUS_CREDIT',
  MANUAL_CREDIT: 'MANUAL_CREDIT',
  MANUAL_DEBIT: 'MANUAL_DEBIT',
});

export const PaymentStatus = Object.freeze({
  PENDING: 'PENDING',
  CAPTURED: 'CAPTURED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
});

export const RefundStatus = Object.freeze({
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  ADDITIONAL_INFO_REQUIRED: 'Additional Info Required',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CREDITED: 'Credited',
});

export const RefundReason = Object.freeze({
  INVALID_CONTACT: 'Invalid contact',
  FAKE_REQUIREMENT: 'Fake requirement',
  DUPLICATE_LEAD: 'Duplicate lead',
  BUYER_ALREADY_PURCHASED: 'Buyer already purchased',
  REQUIREMENT_FULFILLED: 'Requirement fulfilled',
  BUYER_NOT_RESPONDING: 'Buyer not responding',
  OTHER: 'Other',
});

export const RefundLeadOutcome = Object.freeze({
  LEAD_BIN: 'LEAD_BIN',
  RETURN_TO_POOL: 'RETURN_TO_POOL',
  PERMANENTLY_CLOSE: 'PERMANENTLY_CLOSE',
});

export const SupportStatus = Object.freeze({
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  WAITING_ON_USER: 'WAITING_ON_USER',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
});

export const AdminRoleName = Object.freeze({
  SUPER_ADMIN: 'Super Admin',
  OPERATIONS_ADMIN: 'Operations Admin',
  VERIFICATION_ADMIN: 'Verification Admin',
  FINANCE_ADMIN: 'Finance Admin',
  REFUND_ADMIN: 'Refund Admin',
  SUPPORT_ADMIN: 'Support Admin',
  ANALYST: 'Analyst',
});
