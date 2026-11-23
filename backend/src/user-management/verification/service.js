import { User } from '../../shared/models/User.model.js';
import { VerificationRecord } from '../../shared/models/VerificationRecord.model.js';
import { uploadBufferToCloudinary, isCloudinaryConfigured } from '../../config/cloudinary.js';
import { validateUploadFile } from '../../config/storage.js';
import { UserStatus, VerificationStatus } from '../../shared/enums/index.js';

export async function getVerificationStatus(userId) {
  const user = await User.findById(userId).select('status verificationStatus').lean();
  const latestRecord = await VerificationRecord.findOne({ userId }).sort({ createdAt: -1 }).lean();
  return { userStatus: user?.status, verificationStatus: user?.verificationStatus, latestRecord };
}

export async function submitVerification(user, payload, files = []) {
  const uploadedDocs = [];
  for (const file of files) {
    const policy = validateUploadFile(file, 'VERIFICATION_DOC');
    if (isCloudinaryConfigured()) {
      const res = await uploadBufferToCloudinary(file.buffer, {
        folder: policy.folder,
        isPrivate: true,
        resourceType: file.mimetype === 'application/pdf' ? 'raw' : 'image',
      });
      uploadedDocs.push({
        docType: payload.docType || 'SUPPORTING_DOC',
        publicId: res.publicId,
        resourceType: res.resourceType,
        originalName: file.originalname,
      });
    }
  }

  await User.findByIdAndUpdate(user._id, {
    $set: {
      fullName: payload.fullName,
      professionalRole: payload.professionalRole,
      agencyName: payload.agencyName,
      experienceYears: payload.experienceYears,
      city: payload.city,
      workingLocations: payload.workingLocations,
      languages: payload.languages,
      reraNumber: payload.reraNumber || '',
      verificationStatus: VerificationStatus.SUBMITTED,
      status: user.status === UserStatus.ACTIVE ? UserStatus.ACTIVE : UserStatus.PENDING_VERIFICATION,
    },
  });

  const record = await VerificationRecord.create({
    userId: user._id,
    status: VerificationStatus.SUBMITTED,
    submittedSnapshot: {
      fullName: payload.fullName,
      mobile: user.mobile,
      email: user.email,
      professionalRole: payload.professionalRole,
      agencyName: payload.agencyName,
      experienceYears: payload.experienceYears,
      city: payload.city,
      workingLocations: payload.workingLocations,
      languages: payload.languages,
      reraNumber: payload.reraNumber || '',
    },
    documents: uploadedDocs,
  });

  return record;
}
