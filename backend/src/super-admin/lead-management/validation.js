import { z } from 'zod';
import { BudgetBand, LeadPoolState, LeadStatus, PropertyType, SiteVisitStatus } from '../../shared/enums/index.js';

export const createLeadSchema = z.object({
  title: z.string().trim().min(5).max(200),
  requirementSummary: z.string().trim().min(10).max(2000),
  buyerName: z.string().trim().min(2).max(120),
  buyerPhone: z.string().trim().min(8).max(20),
  buyerEmail: z.string().trim().email().optional().or(z.literal('')),
  buyerAlternatePhone: z.string().trim().max(20).optional().default(''),
  buyerNotes: z.string().trim().max(1000).optional().default(''),
  budgetBand: z.enum(Object.values(BudgetBand)),
  budgetMinInr: z.coerce.number().min(0),
  budgetMaxInr: z.coerce.number().min(0),
  propertyType: z.enum(Object.values(PropertyType)),
  city: z.string().trim().min(2).max(80),
  location: z.string().trim().min(2).max(120),
  configuration: z.string().trim().max(80).default(''),
  purchaseTimeline: z.enum(['WITHIN_30_DAYS', 'DAYS_31_TO_90', 'DAYS_90_PLUS', 'EXPLORING']).default('DAYS_31_TO_90'),
  seriousnessScore: z.coerce.number().min(1).max(100).default(75),
  signals: z
    .object({
      contactVerified: z.boolean().default(true),
      budgetConfirmed: z.boolean().default(false),
      exactLocationConfig: z.boolean().default(false),
      siteVisitRequested: z.boolean().default(false),
      buyerActivelyResponding: z.boolean().default(false),
      fundingLoanReadiness: z.boolean().default(false),
    })
    .default({}),
  siteVisitStatus: z.enum(Object.values(SiteVisitStatus)).default(SiteVisitStatus.NONE),
  publishImmediately: z.boolean().default(false),
});

export const updateLeadSchema = createLeadSchema.partial().extend({
  poolState: z.enum(Object.values(LeadPoolState)).optional(),
  currentLeadStatus: z.enum(Object.values(LeadStatus)).nullable().optional(),
  lastRemarkSummary: z.string().trim().max(1000).optional(),
  returnedDiscountApproved: z.boolean().optional(),
  isPermanentlyClosed: z.boolean().optional(),
  closureReason: z.string().trim().max(500).optional(),
});