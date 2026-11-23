import { ensureWallet, calculateCustomRecharge } from '../../logics/wallet/wallet.logic.js';
import { RechargePackage } from '../../shared/models/RechargePackage.model.js';
import { Payment } from '../../shared/models/Payment.model.js';

export async function getWalletOverview(userId) {
  const [wallet, packages, recentPayments] = await Promise.all([
    ensureWallet(userId),
    RechargePackage.find({ isActive: true }).sort({ sortOrder: 1 }).lean(),
    Payment.find({ userId }).sort({ createdAt: -1 }).limit(10).lean(),
  ]);
  return { wallet, packages, recentPayments };
}

export async function getCustomQuote(userId, amountInr) {
  const wallet = await ensureWallet(userId);
  const quote = calculateCustomRecharge(amountInr);
  return {
    ...quote,
    currentBalance: wallet.balancePoints,
    expectedBalanceAfter: wallet.balancePoints + quote.totalPoints,
  };
}
