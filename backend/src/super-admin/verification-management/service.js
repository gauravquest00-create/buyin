import { VerificationRecord } from '../../shared/models/VerificationRecord.model.js';
import { User } from '../../shared/models/User.model.js';
import { Notification } from '../../shared/models/Notification.model.js';
import { getSignedPrivateAssetUrl, isCloudinaryConfigured } from '../../config/cloudinary.js';
import { UserStatus, VerificationStatus } from '../../shared/enums/index.js';
import { NotFoundError } from '../../shared/errors/AppError.js';
import { recordAdminAudit } from '../_helpers/audit.helper.js';

export async function listVerifications(query) {
  const filter = {};
  if (query.status) filter.status = query.status;
  const records = await VerificationRecord.find(filter)
    .populate('userId', 'fullName email mobile city agencyName status verificationStatus')
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return records.map((rec) => ({
    ...rec,
    documents: (rec.documents || []).map((doc) => ({
      ...doc,
      signedPreviewUrl: isCloudinaryConfigured()
        ? getSignedPrivateAssetUrl(doc.publicId, { resourceType: doc.resourceType || 'image', expiresInSeconds: 300 })
        : null,
    })),
  }));
}

export async function reviewVerification(recordId, { status, adminRemarks }, admin, ipAddress) {
  const record = await VerificationRecord.findById(recordId);
  if (!record) throw new NotFoundError('Verification record not found');

  const prev = record.status;
  record.status = status;
  record.adminRemarks = adminRemarks;
  record.reviewedByAdminId = admin._id;
  record.reviewedAt = new Date();
  await record.save();

  const userUpdate = { verificationStatus: status };
  if (status === VerificationStatus.APPROVED) userUpdate.status = UserStatus.ACTIVE;
  else if (status === VerificationStatus.SUSPENDED) userUpdate.status = UserStatus.RESTRICTED;

  await User.findByIdAndUpdate(record.userId, { $set: userUpdate });

  await Notification.create({
    recipientType: 'USER',
    recipientId: record.userId,
    title: `Verification ${status.replace(/_/g, ' ')}`,
    message: adminRemarks || `Your professional verification status is now ${status}.`,
    type: 'VERIFICATION',
    metadata: { recordId: record._id, status },
  });

  await recordAdminAudit({
    admin,
    action: `VERIFICATION_${status}`,
    module: 'verification-management',
    targetType: 'VerificationRecord',
    targetId: record._id,
    reason: adminRemarks,
    beforeState: { status: prev },
    afterState: { status },
    ipAddress,
  });

  return record;
}
