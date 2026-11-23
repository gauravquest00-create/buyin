import mongoose from 'mongoose';
import { BudgetBand, PropertyType, LeadPoolState, LeadStatus, SiteVisitStatus } from '../enums/index.js';

const leadSchema = new mongoose.Schema(
  {
    leadCode: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    requirementSummary: { type: String, required: true, trim: true },
    // Private buyer fields — strictly masked before claiming!
    buyerName: { type: String, required: true, trim: true },
    buyerPhone: { type: String, required: true, trim: true },
    buyerEmail: { type: String, trim: true, lowercase: true, default: '' },
    buyerAlternatePhone: { type: String, trim: true, default: '' },
    buyerNotes: { type: String, trim: true, default: '' },

    // Public discovery fields
    budgetBand: { type: String, enum: Object.values(BudgetBand), required: true, index: true },
    budgetMinInr: { type: Number, min: 0, required: true },
    budgetMaxInr: { type: Number, min: 0, required: true },
    propertyType: { type: String, enum: Object.values(PropertyType), required: true, index: true },
    city: { type: String, required: true, trim: true, index: true },
    location: { type: String, required: true, trim: true, index: true },
    configuration: { type: String, trim: true, default: '' },
    purchaseTimeline: {
      type: String,
      enum: ['WITHIN_30_DAYS', 'DAYS_31_TO_90', 'DAYS_90_PLUS', 'EXPLORING'],
      default: 'DAYS_31_TO_90',
    },
    seriousnessScore: { type: Number, min: 1, max: 100, default: 70 },
    signals: {
      contactVerified: { type: Boolean, default: true },
      budgetConfirmed: { type: Boolean, default: false },
      exactLocationConfig: { type: Boolean, default: false },
      siteVisitRequested: { type: Boolean, default: false },
      buyerActivelyResponding: { type: Boolean, default: false },
      fundingLoanReadiness: { type: Boolean, default: false },
    },
    siteVisitStatus: { type: String, enum: Object.values(SiteVisitStatus), default: SiteVisitStatus.NONE, index: true },
    verifiedVisitsCount: { type: Number, default: 0 },

    poolState: { type: String, enum: Object.values(LeadPoolState), default: LeadPoolState.DRAFT, index: true },
    currentLeadStatus: { type: String, enum: Object.values(LeadStatus), default: null },
    activeClaimId: { type: mongoose.Schema.Types.ObjectId, ref: 'Claim', default: null, index: true },
    activeOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    ownershipExpiresAt: { type: Date, default: null, index: true },

    isReturnedLead: { type: Boolean, default: false, index: true },
    returnCount: { type: Number, default: 0 },
    returnedDiscountApproved: { type: Boolean, default: false },
    lastRemarkSummary: { type: String, default: '' },
    lastFollowUpAt: { type: Date, default: null },
    computedClaimPoints: { type: Number, required: true, min: 1 },
    pricingSnapshot: { type: mongoose.Schema.Types.Mixed, default: {} },
    isPermanentlyClosed: { type: Boolean, default: false, index: true },
    closureReason: { type: String, default: '' },
    createdByAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
  },
  { timestamps: true, collection: 'leads' }
);

leadSchema.index({ poolState: 1, city: 1, location: 1, budgetBand: 1, propertyType: 1 });
leadSchema.index({ poolState: 1, isReturnedLead: 1, createdAt: -1 });
export const Lead = mongoose.model('Lead', leadSchema);
