import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    actorType: { type: String, enum: ['ADMIN', 'USER', 'SYSTEM'], required: true, index: true },
    actorId: { type: mongoose.Schema.Types.ObjectId, default: null, index: true },
    actorEmail: { type: String, default: '' },
    action: { type: String, required: true, index: true },
    module: { type: String, required: true, index: true },
    targetType: { type: String, default: '' },
    targetId: { type: String, default: '' },
    reason: { type: String, default: '' },
    beforeState: { type: mongoose.Schema.Types.Mixed, default: null },
    afterState: { type: mongoose.Schema.Types.Mixed, default: null },
    ipAddress: { type: String, default: '' },
  },
  { timestamps: true, collection: 'audit_logs' }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.pre(['updateOne', 'findOneAndUpdate', 'deleteOne', 'findOneAndDelete'], function () {
  throw new Error('AuditLog records are immutable.');
});

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
