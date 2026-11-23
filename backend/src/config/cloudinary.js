import { v2 as cloudinary } from 'cloudinary';
import env from './environment.js';
import { AppError } from '../shared/errors/AppError.js';

export function isCloudinaryConfigured() {
  return Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);
}

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export async function uploadBufferToCloudinary(buffer, { folder, resourceType = 'auto', isPrivate = true, publicId }) {
  if (!isCloudinaryConfigured()) {
    throw new AppError('Cloudinary media storage is not configured.', 503, 'STORAGE_NOT_CONFIGURED');
  }
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        type: isPrivate ? 'authenticated' : 'upload',
        access_mode: isPrivate ? 'authenticated' : 'public',
        public_id: publicId,
        overwrite: false,
      },
      (err, result) => {
        if (err) return reject(err);
        resolve({
          publicId: result.public_id,
          resourceType: result.resource_type,
          format: result.format,
          bytes: result.bytes,
          isPrivate,
          url: isPrivate ? null : result.secure_url,
        });
      }
    );
    uploadStream.end(buffer);
  });
}

/**
 * Generates a short-lived signed delivery URL for private verification/refund assets.
 */
export function getSignedPrivateAssetUrl(publicId, { resourceType = 'image', expiresInSeconds = 300 } = {}) {
  if (!isCloudinaryConfigured()) {
    throw new AppError('Cloudinary media storage is not configured.', 503, 'STORAGE_NOT_CONFIGURED');
  }
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
  return cloudinary.url(publicId, {
    resource_type: resourceType,
    type: 'authenticated',
    sign_url: true,
    secure: true,
    expires_at: expiresAt,
  });
}

export async function deleteCloudinaryAsset(publicId, resourceType = 'image') {
  if (!isCloudinaryConfigured()) return { result: 'skipped_unconfigured' };
  return cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
    type: 'authenticated',
  });
}

export { cloudinary };
