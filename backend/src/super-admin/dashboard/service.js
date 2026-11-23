import { User } from '../../shared/models/User.model.js';
import { Lead } from '../../shared/models/Lead.model.js';
import { Claim } from '../../shared/models/Claim.model.js';
import { Payment } from '../../shared/models/Payment.model.js';
import { RefundRequest } from '../../shared/models/RefundRequest.model.js';
import { VerificationRecord } from '../../shared/models/VerificationRecord.model.js';
import { AuditLog } from '../../shared/models/AuditLog.model.js';
import { ClaimStatus, LeadPoolState, PaymentStatus, RefundStatus, VerificationStatus } from '../../shared/enums/index.js';

export async function getAdminDashboardOverview() {
  const [
    totalUsers,
    pendingVerifications,
    availableLeads,
    activeClaims,
    pendingRefunds,
    revenueAgg,
    recentAudits,
  ] = await Promise.all([
    User.countDocuments(),
    VerificationRecord.countDocuments({ status: { $in: [VerificationStatus.SUBMITTED, VerificationStatus.UNDER_REVIEW] } }),
    Lead.countDocuments({ poolState: LeadPoolState.AVAILABLE }),
    Claim.countDocuments({ status: { $in: [ClaimStatus.ACTIVE, ClaimStatus.EXTENDED] } }),
    RefundRequest.countDocuments({ status: { $in: [RefundStatus.SUBMITTED, RefundStatus.UNDER_REVIEW] } }),
    Payment.aggregate([
      { $match: { status: PaymentStatus.CAPTURED } },
      { $group: { _id: null, totalRevenueInr: { $sum: '$amountInr' }, totalPointsIssued: { $sum: '$totalPoints' }, count: { $sum: 1 } } },
    ]),
    AuditLog.find().sort({ createdAt: -1 }).limit(10).lean(),
  ]);

  const rev = revenueAgg[0] || { totalRevenueInr: 0, totalPointsIssued: 0, count: 0 };

  return {
    kpis: {
      totalUsers,
      pendingVerifications,
      availableLeads,
      activeClaims,
      pendingRefunds,
      totalRevenueInr: rev.totalRevenueInr,
      totalPointsIssued: rev.totalPointsIssued,
      capturedPaymentsCount: rev.count,
    },
    recentAudits,
  };
}
