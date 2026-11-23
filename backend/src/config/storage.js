import multer from 'multer';
import { AppError } from '../shared/errors/AppError.js';

export const UPLOAD_POLICIES = Object.freeze({
  PROFILE_AVATAR: {
    folder: 'buyin/avatars',
    isPrivate: false,
    maxBytes: 2 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  VERIFICATION_DOC: {
    folder: 'buyin/verification-docs',
    isPrivate: true,
    maxBytes: 5 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  },
  REFUND_EVIDENCE: {
    folder: 'buyin/refund-evidence',
    isPrivate: true,
    maxBytes: 8 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'audio/mpeg', 'audio/wav'],
  },
  SUPPORT_ATTACHMENT: {
    folder: 'buyin/support-attachments',
    isPrivate: true,
    maxBytes: 5 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  },
});

export function validateUploadFile(file, policyKey) {
  const policy = UPLOAD_POLICIES[policyKey];
  if (!policy) throw new AppError('Invalid upload policy', 400, 'INVALID_UPLOAD_POLICY');
  if (!file) throw new AppError('No file uploaded', 400, 'FILE_REQUIRED');
  if (!policy.allowedMimeTypes.includes(file.mimetype)) {
    throw new AppError(
      `Unsupported file type (${file.mimetype}). Allowed: ${policy.allowedMimeTypes.join(', ')}`,
      400,
      'INVALID_FILE_TYPE'
    );
  }
  if (file.size > policy.maxBytes) {
    throw new AppError(
      `File exceeds maximum allowed size of ${Math.round(policy.maxBytes / (1024 * 1024))}MB`,
      400,
      'FILE_TOO_LARGE'
    );
  }
  return policy;
}

export function createMemoryUpload(policyKey) {
  const policy = UPLOAD_POLICIES[policyKey];
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: policy.maxBytes },
    fileFilter(_req, file, cb) {
      if (!policy.allowedMimeTypes.includes(file.mimetype)) {
        return cb(new AppError(`Unsupported file type: ${file.mimetype}`, 400, 'INVALID_FILE_TYPE'));
      }
      cb(null, true);
    },
  });
}
