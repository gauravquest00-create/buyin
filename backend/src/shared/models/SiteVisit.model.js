import mongoose from 'mongoose';

const siteVisitSchema = new mongoose.Schema(
  {
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
    claimId: { type: mongoose.Schema.Types.ObjectId, ref: 'Claim', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    scheduledAt: { type: Date, required: true, index: true },
    propertyAddress: { type: String, required: true, trim: true },
    status: { type: String, enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'], default: 'SCHEDULED' },
    verifiedByAdmin: { type: Boolean, default: false },
    notes: { type: String, trim: true, default: '' },
  },
  { timestamps: true, collection: 'site_visits' }
);

export const SiteVisit = mongoose.model('SiteVisit', siteVisitSchema);
