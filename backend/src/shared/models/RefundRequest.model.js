import mongoose from 'mongoose';
import { RefundStatus, RefundReason, RefundLeadOutcome } from '../enums/index.js';

const refundRequestSchema = new mongoose.Schema(
  {
    refundCode: { type: String, required: true, unique: true, index: true },
    claimId: { type: mongoose.Schema.Types.ObjectId, ref: 'Claim', required: true, unique: true, index: true },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    reason: { type: String, enum: Object.values(RefundReason), required: true },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    evidenceFiles: [
      {
        publicId: String,
        resourceType: String,
        originalName: String,
        mimeType: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    originalClaimPoints: { type: Number, required: true, min: 1 },
    deductionPoints: { type: Number, required: true, min: 0 },
    refundablePoints: { type: Number, required: true, min: 0 },
    status: { type: String, enum: Object.values(RefundStatus), default: RefundStatus.SUBMITTED, index: true },
    adminRemarks: { type: String, default: '' },
    userAdditionalInfo: { type: String, default: '' },
    leadOutcome: { type: String, enum: [...Object.values(RefundLeadOutcome), null], default: null },
    reviewedByAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
    reviewedAt: { type: Date, default: null },
    creditedAt: { type: Date, default: null },
    walletTransactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'WalletTransaction', default: null },
  },
  { timestamps: true, collection: 'refund_requests' }
);

export const RefundRequest = mongoose.model('RefundRequest', refundRequestSchema);
