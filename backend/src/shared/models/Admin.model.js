import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
    customPermissions: [{ type: String }],
    isActive: { type: Boolean, default: true, index: true },
    isBootstrapAdmin: { type: Boolean, default: false },
    mustChangePassword: { type: Boolean, default: false },
    mfaEnabled: { type: Boolean, default: false },
    mfaSecret: { type: String, select: false, default: null },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true, collection: 'admins' }
);

export const Admin = mongoose.model('Admin', adminSchema);
