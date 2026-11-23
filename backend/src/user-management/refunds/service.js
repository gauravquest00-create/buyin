import { RefundRequest } from '../../shared/models/RefundRequest.model.js';
import { Claim } from '../../shared/models/Claim.model.js';
import { calculateRefundBreakdown, submitRefundRequest } from '../../logics/refund/refund.logic.js';
import { uploadBufferToCloudinary, isCloudinaryConfigured } from '../../config/cloudinary.js';
import { validateUploadFile } from '../../config/storage.js';
import { RefundStatus } from '../../shared/enums/index.js';
import { NotFoundError, ValidationError } from '../../shared/errors/AppError.js';

export async function previewRefund(userId, claimId) {
  const claim = await Claim.findOne({ _id: claimId, userId }).lean();
  if (!claim) throw new NotFoundError('Claim not found');
  return calculateRefundBreakdown(claim.originalClaimPoints);
}

export async function createRefund(userId, payload, files = []) {
  const evidenceFiles = [];
  for (const file of files) {
    const policy = validateUploadFile(file, 'REFUND_EVIDENCE');
    if (isCloudinaryConfigured()) {
      const uploaded = await uploadBufferToCloudinary(file.buffer, {
        folder: policy.folder,
        isPrivate: true,
        resourceType: file.mimetype.startsWith('image/') ? 'image' : 'raw',
      });
      evidenceFiles.push({
        publicId: uploaded.publicId,
        resourceType: uploaded.resourceType,
        originalName: file.originalname,
        mimeType: file.mimetype,
      });
    }
  }
  return submitRefundRequest({ userId, ...payload, evidenceFiles });
}

export async function listMyRefunds(userId) {
  return RefundRequest.find({ userId })
    .populate('leadId', 'leadCode title city location')
    .populate('claimId', 'claimCode originalClaimPoints')
    .sort({ createdAt: -1 })
    .lean();
}

export async function respondAdditionalInfo(userId, refundId, additionalInfo) {
  const refund = await RefundRequest.findOne({ _id: refundId, userId });
  if (!refund) throw new NotFoundError('Refund request not found');
  if (refund.status !== RefundStatus.ADDITIONAL_INFO_REQUIRED) {
    throw new ValidationError('This refund request is not awaiting additional information');
  }
  refund.userAdditionalInfo = additionalInfo;
  refund.status = RefundStatus.UNDER_REVIEW;
  await refund.save();
  return refund;
}
