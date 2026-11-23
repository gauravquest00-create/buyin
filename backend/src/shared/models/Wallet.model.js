import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    balancePoints: { type: Number, required: true, default: 0, min: 0 },
    totalRechargedPoints: { type: Number, default: 0, min: 0 },
    totalBonusPoints: { type: Number, default: 0, min: 0 },
    totalSpentPoints: { type: Number, default: 0, min: 0 },
    totalRefundedPoints: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true, collection: 'wallets' }
);

export const Wallet = mongoose.model('Wallet', walletSchema);
