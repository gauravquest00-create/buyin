import { Lead } from '../../shared/models/Lead.model.js';
import { LeadPoolState } from '../../shared/enums/index.js';
import { recordAdminAudit } from '../_helpers/audit.helper.js';

export async function getPoolOverview() {
  const counts = await Lead.aggregate([{ $group: { _id: '$poolState', count: { $sum: 1 } } }]);
  const returnedCount = await Lead.countDocuments({ poolState: LeadPoolState.AVAILABLE, isReturnedLead: true });
  return {
    byState: Object.fromEntries(counts.map((c) => [c._id, c.count])),
    returnedAvailableCount: returnedCount,
  };
}

export async function approveReturnedDiscount(leadId, approved, admin, ipAddress) {
  const lead = await Lead.findByIdAndUpdate(leadId, { $set: { returnedDiscountApproved: Boolean(approved) } }, { new: true });
  await recordAdminAudit({
    admin,
    action: 'RETURNED_LEAD_DISCOUNT_UPDATED',
    module: 'lead-pool-management',
    targetType: 'Lead',
    targetId: leadId,
    afterState: { returnedDiscountApproved: Boolean(approved) },
    ipAddress,
  });
  return lead;
}
