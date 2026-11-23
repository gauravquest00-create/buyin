import mongoose from 'mongoose';
import { ClaimStatus } from '../enums/index.js';

const claimSchema = new mongoose.Schema(
  {
    claimCode: { type: String, required: true, unique: true, index: true },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: Object.values(ClaimStatus), default: ClaimStatus.ACTIVE, index: true },
    claimedAt: { type: Date, default: Date.now, index: true },
    originalExpiresAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true, index: true },

    // Immutable pricing snapshot at the time of claim
    originalClaimPoints: { type: Number, required: true, min: 1 },
    pricingSnapshot: { type: mongoose.Schema.Types.Mixed, required: true },
    claimTransactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'WalletTransaction', required: true },

    // Ownership extension tracking (7 days at 25% of original claim points)
    extensionCount: { type: Number, default: 0 },
    extensionPointsPaid: { type: Number, default: 0 },
    extendedAt: { type: Date, default: null },
    extensionTransactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'WalletTransaction', default: null },

    // Review hold & resolution
    refundHoldActive: { type: Boolean, default: false, index: true },
    closedAt: { type: Date, default: null },
    revokedAt: { type: Date, default: null },
    revocationReason: { type: String, default: '' },
    revokedByAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
  },
  { timestamps: true, collection: 'claims' }
);

// CRITICAL DATABASE RULE: One active owner per lead enforced at DB level!
claimSchema.index(
  { leadId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: [ClaimStatus.ACTIVE, ClaimStatus.EXTENDED, ClaimStatus.REFUND_HOLD] },
    },
    name: 'unique_active_claim_per_lead',
  }
);

export const Claim = mongoose.model('Claim', claimSchema);
