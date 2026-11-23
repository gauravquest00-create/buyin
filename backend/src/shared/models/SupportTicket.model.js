import mongoose from 'mongoose';
import { SupportStatus } from '../enums/index.js';

const supportTicketSchema = new mongoose.Schema(
  {
    ticketCode: { type: String, required: true, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subject: { type: String, required: true, trim: true, maxlength: 200 },
    category: { type: String, enum: ['WALLET', 'CLAIM', 'REFUND', 'VERIFICATION', 'TECHNICAL', 'OTHER'], default: 'OTHER' },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
    status: { type: String, enum: Object.values(SupportStatus), default: SupportStatus.OPEN, index: true },
    assignedAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
    messages: [
      {
        senderType: { type: String, enum: ['USER', 'ADMIN'], required: true },
        senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
        body: { type: String, required: true, trim: true },
        attachment: {
          publicId: String,
          resourceType: String,
          originalName: String,
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true, collection: 'support_tickets' }
);

export const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);
