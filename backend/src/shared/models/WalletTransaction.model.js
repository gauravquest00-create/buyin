import mongoose from 'mongoose';
import { WalletTxType } from '../enums/index.js';

const walletTransactionSchema = new mongoose.Schema(
  {
    txCode: { type: String, required: true, unique: true, index: true },
    walletId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: Object.values(WalletTxType), required: true, index: true },
    direction: { type: String, enum: ['CREDIT', 'DEBIT'], required: true },
    points: { type: Number, required: true, min: 1 },
    balanceBefore: { type: Number, required: true, min: 0 },
    balanceAfter: { type: Number, required: true, min: 0 },
    reason: { type: String, required: true, trim: true },
    idempotencyKey: { type: String, required: true, unique: true, index: true },
    referenceType: { type: String, enum: ['PAYMENT', 'CLAIM', 'EXTENSION', 'REFUND', 'ADMIN_ADJUSTMENT', 'BONUS'], required: true },
    referenceId: { type: mongoose.Schema.Types.ObjectId, default: null },
    performedByAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, collection: 'wallet_transactions' }
);

walletTransactionSchema.index({ userId: 1, createdAt: -1 });
// Prevent mutation/deletion of immutable financial ledger
walletTransactionSchema.pre(['updateOne', 'findOneAndUpdate', 'deleteOne', 'findOneAndDelete'], function () {
  throw new Error('WalletTransaction ledger entries are strictly immutable.');
});

export const WalletTransaction = mongoose.model('WalletTransaction', walletTransactionSchema);
