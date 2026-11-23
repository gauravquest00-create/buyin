import mongoose from 'mongoose';

const otpRecordSchema = new mongoose.Schema(
  {
    identifier: { type: String, required: true, index: true },
    purpose: { type: String, enum: ['REGISTER', 'PASSWORD_RESET', 'MOBILE_VERIFY'], required: true },
    otpHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    resendCount: { type: Number, default: 0 },
    lastSentAt: { type: Date, default: Date.now },
    deliveryStatus: { type: String, default: 'PENDING' },
    providerRequestId: { type: String, default: null },
    verifiedAt: { type: Date, default: null },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true, collection: 'otp_records' }
);

otpRecordSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const OtpRecord = mongoose.model('OtpRecord', otpRecordSchema);
