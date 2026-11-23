import { BudgetBand, PropertyType, AdminRoleName } from '../enums/index.js';

export const BUSINESS_RULES = Object.freeze({
  OWNERSHIP_DAYS: 20,
  EXTENSION_DAYS: 7,
  EXTENSION_COST_RATIO: 0.25,
  MAX_EXTENSIONS_PER_CLAIM: 1,
  REFUND_DEDUCTION_RATIO: 0.05,
  REFUND_CREDIT_RATIO: 0.95,
  CUSTOM_RECHARGE_MIN_INR: 500,
  CUSTOM_RECHARGE_POINTS_PER_INR: 0.9,
});

export const DEFAULT_RECHARGE_PACKAGES = Object.freeze([
  {
    code: 'PKG_500',
    name: 'Starter Pack',
    amountInr: 500,
    basePoints: 450,
    bonusPoints: 0,
    totalPoints: 450,
    isActive: true,
    sortOrder: 1,
  },
  {
    code: 'PKG_1000',
    name: 'Growth Pack',
    amountInr: 1000,
    basePoints: 900,
    bonusPoints: 0,
    totalPoints: 900,
    isActive: true,
    sortOrder: 2,
  },
  {
    code: 'PKG_2000',
    name: 'Pro Bonus Pack',
    amountInr: 2000,
    basePoints: 1800,
    bonusPoints: 150,
    totalPoints: 1950,
    isActive: true,
    sortOrder: 3,
  },
]);

export const DEFAULT_PRICING_CONFIG = Object.freeze({
  budgetBasePoints: {
    [BudgetBand.BELOW_50L]: 120,
    [BudgetBand.L50_TO_1CR]: 180,
    [BudgetBand.CR1_TO_2CR]: 260,
    [BudgetBand.CR2_TO_5CR]: 380,
    [BudgetBand.CR5_TO_10CR]: 550,
    [BudgetBand.ABOVE_10CR]: 750,
  },
  propertyTypeAdditions: {
    [PropertyType.APARTMENT]: 0,
    [PropertyType.BUILDER_FLOOR]: 20,
    [PropertyType.RESIDENTIAL_PLOT]: 30,
    [PropertyType.INDEPENDENT_HOUSE]: 40,
    [PropertyType.VILLA_LUXURY]: 60,
    [PropertyType.COMMERCIAL]: 80,
  },
  buyerSignals: {
    contactVerified: 20,
    budgetConfirmed: 20,
    exactLocationConfig: 15,
    purchaseWithin30Days: 30,
    purchaseWithin31To90Days: 20,
    siteVisitRequested: 25,
    buyerActivelyResponding: 20,
    fundingLoanReadiness: 20,
  },
  siteVisitPremiums: {
    scheduled: 40,
    completedVerified: 120,
    multipleVerified: 150,
  },
  returnedLeadDiscounts: {
    firstReturnDiscountPercent: 10,
    recentFollowUpDiscountPercent: 0,
    staleFollowUpDays: 10,
    staleFollowUpDiscountPercent: 15,
    applyOnlyWhenApproved: true,
  },
});

export const ALL_PERMISSIONS = Object.freeze([
  'dashboard:read',
  'users:read', 'users:write', 'users:suspend',
  'verifications:read', 'verifications:approve', 'verifications:reject',
  'leads:read', 'leads:write', 'leads:publish', 'leads:archive',
  'claims:read', 'claims:revoke',
  'wallets:read', 'wallets:adjust',
  'pricing:read', 'pricing:write',
  'payments:read', 'payments:reconcile',
  'refunds:read', 'refunds:review', 'refunds:approve',
  'categories:read', 'categories:write',
  'notifications:read', 'notifications:send',
  'support:read', 'support:write',
  'reports:read', 'reports:export',
  'roles:read', 'roles:write',
  'admins:read', 'admins:write',
  'settings:read', 'settings:write',
  'audit:read',
]);

export const DEFAULT_ROLE_PERMISSIONS = Object.freeze({
  [AdminRoleName.SUPER_ADMIN]: [...ALL_PERMISSIONS],
  [AdminRoleName.OPERATIONS_ADMIN]: [
    'dashboard:read', 'users:read', 'leads:read', 'leads:write', 'leads:publish', 'leads:archive',
    'claims:read', 'claims:revoke', 'categories:read', 'categories:write', 'notifications:read', 'notifications:send',
  ],
  [AdminRoleName.VERIFICATION_ADMIN]: [
    'dashboard:read', 'users:read', 'verifications:read', 'verifications:approve', 'verifications:reject',
  ],
  [AdminRoleName.FINANCE_ADMIN]: [
    'dashboard:read', 'wallets:read', 'wallets:adjust', 'payments:read', 'payments:reconcile', 'pricing:read', 'reports:read', 'reports:export',
  ],
  [AdminRoleName.REFUND_ADMIN]: [
    'dashboard:read', 'claims:read', 'refunds:read', 'refunds:review', 'refunds:approve', 'wallets:read',
  ],
  [AdminRoleName.SUPPORT_ADMIN]: [
    'dashboard:read', 'users:read', 'support:read', 'support:write', 'notifications:read', 'notifications:send',
  ],
  [AdminRoleName.ANALYST]: [
    'dashboard:read', 'reports:read', 'reports:export', 'leads:read', 'claims:read', 'payments:read', 'audit:read',
  ],
});
