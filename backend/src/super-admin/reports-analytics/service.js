import { Lead } from '../../shared/models/Lead.model.js';
import { Claim } from '../../shared/models/Claim.model.js';
import { Payment } from '../../shared/models/Payment.model.js';
import { RefundRequest } from '../../shared/models/RefundRequest.model.js';
import { PaymentStatus } from '../../shared/enums/index.js';

export async function generateBusinessAnalytics() {
  const [leadsByCity, claimsByStatus, refundsByStatus, revenueByMonth] = await Promise.all([
    Lead.aggregate([{ $group: { _id: '$city', count: { $sum: 1 }, avgPoints: { $avg: '$computedClaimPoints' } } }, { $sort: { count: -1 } }]),
    Claim.aggregate([{ $group: { _id: '$status', count: { $sum: 1 }, totalPoints: { $sum: '$originalClaimPoints' } } }]),
    RefundRequest.aggregate([{ $group: { _id: '$status', count: { $sum: 1 }, totalRefundedPoints: { $sum: '$refundablePoints' } } }]),
    Payment.aggregate([
      { $match: { status: PaymentStatus.CAPTURED } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenueInr: { $sum: '$amountInr' },
          paymentsCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  return { leadsByCity, claimsByStatus, refundsByStatus, revenueByMonth };
}
