import { PricingRule } from '../../shared/models/PricingRule.model.js';
import { recordAdminAudit } from '../_helpers/audit.helper.js';

export async function getActivePricing() {
  const active = await PricingRule.findOne({ isActive: true }).sort({ version: -1 }).lean();
  const history = await PricingRule.find().sort({ version: -1 }).limit(10).lean();
  return { active, history };
}

export async function updatePricingRules(payload, admin, ipAddress) {
  const latest = await PricingRule.findOne().sort({ version: -1 }).lean();
  const nextVersion = (latest?.version || 0) + 1;
  await PricingRule.updateMany({ isActive: true }, { $set: { isActive: false } });
  const rule = await PricingRule.create({
    version: nextVersion,
    isActive: true,
    ...payload,
    updatedByAdminId: admin._id,
  });

  await recordAdminAudit({
    admin,
    action: 'PRICING_RULE_UPDATED',
    module: 'pricing-management',
    targetType: 'PricingRule',
    targetId: rule._id,
    reason: payload.changeNotes,
    afterState: { version: nextVersion },
    ipAddress,
  });

  return rule;
}
