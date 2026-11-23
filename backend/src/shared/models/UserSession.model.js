import mongoose from 'mongoose';

const userSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true },
    userAgent: { type: String, default: '' },
    ipAddress: { type: String, default: '' },
    expiresAt: { type: Date, required: true, index: true },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true, collection: 'user_sessions' }
);

userSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const UserSession = mongoose.model('UserSession', userSessionSchema);
