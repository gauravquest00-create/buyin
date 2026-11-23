import mongoose from 'mongoose';

const pricingRuleSchema = new mongoose.Schema(
  {
    version: { type: Number, required: true, unique: true },
    isActive: { type: Boolean, default: true, index: true },
    budgetBasePoints: { type: mongoose.Schema.Types.Mixed, required: true },
    propertyTypeAdditions: { type: mongoose.Schema.Types.Mixed, required: true },
    buyerSignals: { type: mongoose.Schema.Types.Mixed, required: true },
    siteVisitPremiums: { type: mongoose.Schema.Types.Mixed, required: true },
    returnedLeadDiscounts: { type: mongoose.Schema.Types.Mixed, required: true },
    updatedByAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
    changeNotes: { type: String, default: '' },
  },
  { timestamps: true, collection: 'pricing_rules' }
);

export const PricingRule = mongoose.model('PricingRule', pricingRuleSchema);
