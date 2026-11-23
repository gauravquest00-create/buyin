import { RefundRequest } from '../../shared/models/RefundRequest.model.js';
import { Notification } from '../../shared/models/Notification.model.js';
import { approveRefundAtomically, rejectRefundAtomically } from '../../logics/refund/refund.logic.js';
import { getSignedPrivateAssetUrl, isCloudinaryConfigured } from '../../config/cloudinary.js';
import { RefundStatus } from '../../shared/enums/index.js';
import { NotFoundError } from '../../shared/errors/AppError.js';

export async function listRefunds(query) {
  const filter = {};
  if (query.status) filter.status = query.status;
  const refunds = await RefundRequest.find(filter)
    .populate('userId', 'fullName email mobile')
    .populate('leadId', 'leadCode title city location')
    .populate('claimId', 'claimCode originalClaimPoints')
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return refunds.map((r) => ({
    ...r,
    evidenceFiles: (r.evidenceFiles || []).map((f) => ({
      ...f,
      signedPreviewUrl: isCloudinaryConfigured()
        ? getSignedPrivateAssetUrl(f.publicId, { resourceType: f.resourceType || 'image', expiresInSeconds: 300 })
        : null,
    })),
  }));
}

export async function requestAdditionalInfo(refundId, adminRemarks, admin) {
  const refund = await RefundRequest.findById(refundId);
  if (!refund) throw new NotFoundError('Refund request not found');
  refund.status = RefundStatus.ADDITIONAL_INFO_REQUIRED;
  refund.adminRemarks = adminRemarks;
  refund.reviewedByAdminId = admin._id;
  await refund.save();

  await Notification.create({
    recipientType: 'USER',
    recipientId: refund.userId,
    title: 'Additional Information Required for Refund',
    message: `Admin requested more details for refund ${refund.refundCode}: ${adminRemarks}`,
    type: 'REFUND',
    metadata: { refundId: refund._id },
  });
  return refund;
}

export { approveRefundAtomically, rejectRefundAtomically };
