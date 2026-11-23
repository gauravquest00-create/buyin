import mongoose from 'mongoose';

const followUpSchema = new mongoose.Schema(
  {
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
    claimId: { type: mongoose.Schema.Types.ObjectId, ref: 'Claim', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    note: { type: String, required: true, trim: true },
    nextFollowUpAt: { type: Date, default: null, index: true },
    reminderSent: { type: Boolean, default: false, index: true },
    channel: { type: String, enum: ['CALL', 'WHATSAPP', 'EMAIL', 'MEETING', 'OTHER'], default: 'CALL' },
  },
  { timestamps: true, collection: 'follow_ups' }
);

export const FollowUp = mongoose.model('FollowUp', followUpSchema);
