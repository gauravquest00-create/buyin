import mongoose from 'mongoose';
import { VerificationStatus } from '../enums/index.js';

const verificationRecordSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: Object.values(VerificationStatus), default: VerificationStatus.SUBMITTED, index: true },
    submittedSnapshot: {
      fullName: String,
      mobile: String,
      email: String,
      professionalRole: String,
      agencyName: String,
      experienceYears: Number,
      city: String,
      workingLocations: [String],
      languages: [String],
      reraNumber: String,
    },
    documents: [
      {
        docType: { type: String, required: true },
        publicId: { type: String, required: true },
        resourceType: { type: String, default: 'image' },
        originalName: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    adminRemarks: { type: String, default: '' },
    reviewedByAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true, collection: 'verification_records' }
);

export const VerificationRecord = mongoose.model('VerificationRecord', verificationRecordSchema);
