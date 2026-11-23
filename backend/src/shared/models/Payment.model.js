import mongoose from 'mongoose';
import { PaymentStatus } from '../enums/index.js';

const paymentSchema = new mongoose.Schema(
  {
    internalTransactionId: { type: String, required: true, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'RechargePackage', default: null },
    isCustomRecharge: { type: Boolean, default: false },
    amountInr: { type: Number, required: true, min: 500 },
    amountPaise: { type: Number, required: true, min: 50000 },
    basePoints: { type: Number, required: true, min: 1 },
    bonusPoints: { type: Number, default: 0, min: 0 },
    totalPoints: { type: Number, required: true, min: 1 },
    razorpayOrderId: { type: String, required: true, unique: true, index: true },
    razorpayPaymentId: { type: String, sparse: true, unique: true, index: true },
    razorpaySignatureVerified: { type: Boolean, default: false },
    webhookVerified: { type: Boolean, default: false },
    status: { type: String, enum: Object.values(PaymentStatus), default: PaymentStatus.PENDING, index: true },
    walletCredited: { type: Boolean, default: false, index: true },
    walletTransactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'WalletTransaction', default: null },
    bonusTransactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'WalletTransaction', default: null },
    failureReason: { type: String, default: '' },
    reconciledAt: { type: Date, default: null },
  },
  { timestamps: true, collection: 'payments' }
);

export const Payment = mongoose.model('Payment', paymentSchema);
