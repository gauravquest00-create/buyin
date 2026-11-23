import { User } from '../../shared/models/User.model.js';
import { uploadBufferToCloudinary } from '../../config/cloudinary.js';
import { validateUploadFile } from '../../config/storage.js';
import { UserStatus } from '../../shared/enums/index.js';

export async function getProfile(userId) {
  return User.findById(userId).select('-passwordHash').lean();
}

export async function updateProfile(userId, updates) {
  const user = await User.findById(userId);
  Object.assign(user, updates);
  if (user.status === UserStatus.PENDING_ONBOARDING && user.city && user.professionalRole) {
    user.status = UserStatus.PENDING_VERIFICATION;
  }
  await user.save();
  return User.findById(userId).select('-passwordHash').lean();
}

export async function uploadAvatar(userId, file) {
  const policy = validateUploadFile(file, 'PROFILE_AVATAR');
  const uploaded = await uploadBufferToCloudinary(file.buffer, {
    folder: policy.folder,
    isPrivate: policy.isPrivate,
    resourceType: 'image',
  });
  await User.findByIdAndUpdate(userId, {
    $set: { avatar: { publicId: uploaded.publicId, url: uploaded.url } },
  });
  return uploaded;
}
