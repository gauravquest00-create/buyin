import mongoose from 'mongoose';

const rechargePackageSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    amountInr: { type: Number, required: true, min: 500 },
    basePoints: { type: Number, required: true, min: 1 },
    bonusPoints: { type: Number, required: true, default: 0, min: 0 },
    totalPoints: { type: Number, required: true, min: 1 },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true, collection: 'recharge_packages' }
);

export const RechargePackage = mongoose.model('RechargePackage', rechargePackageSchema);
