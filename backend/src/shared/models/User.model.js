import mongoose from 'mongoose';
import { UserStatus, VerificationStatus } from '../enums/index.js';

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    mobile: { type: String, required: true, unique: true, trim: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    mobileVerified: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    status: { type: String, enum: Object.values(UserStatus), default: UserStatus.PENDING_OTP, index: true },
    verificationStatus: {
      type: String,
      enum: Object.values(VerificationStatus),
      default: VerificationStatus.NOT_SUBMITTED,
      index: true,
    },
    professionalRole: { type: String, trim: true, default: '' },
    agencyName: { type: String, trim: true, default: '' },
    experienceYears: { type: Number, min: 0, max: 60, default: 0 },
    city: { type: String, trim: true, default: '', index: true },
    workingLocations: [{ type: String, trim: true }],
    languages: [{ type: String, trim: true }],
    reraNumber: { type: String, trim: true, default: '' },
    propertyPreferences: [{ type: String, trim: true }],
    budgetPreferences: [{ type: String, trim: true }],
    avatar: {
      publicId: String,
      url: String,
    },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
    suspensionReason: { type: String, default: '' },
  },
  { timestamps: true, collection: 'users' }
);

export const User = mongoose.model('User', userSchema);
