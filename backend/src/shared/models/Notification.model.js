import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipientType: { type: String, enum: ['USER', 'ADMIN'], required: true, index: true },
    recipientId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['CLAIM', 'EXTENSION', 'EXPIRY', 'LEAD_RETURN', 'WALLET', 'REFUND', 'VERIFICATION', 'FOLLOW_UP', 'SYSTEM'],
      default: 'SYSTEM',
    },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, collection: 'notifications' }
);

notificationSchema.index({ recipientType: 1, recipientId: 1, isRead: 1, createdAt: -1 });
export const Notification = mongoose.model('Notification', notificationSchema);
