import mongoose from 'mongoose';
import { LeadStatus } from '../enums/index.js';

const leadStatusHistorySchema = new mongoose.Schema(
  {
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
    claimId: { type: mongoose.Schema.Types.ObjectId, ref: 'Claim', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    previousStatus: { type: String, default: null },
    newStatus: { type: String, enum: Object.values(LeadStatus), required: true },
    remark: { type: String, trim: true, default: '' },
  },
  { timestamps: true, collection: 'lead_status_history' }
);

export const LeadStatusHistory = mongoose.model('LeadStatusHistory', leadStatusHistorySchema);
