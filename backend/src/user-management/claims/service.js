import { claimLeadAtomically, extendClaimOwnership, calculateExtensionCost } from '../../logics/claim/claim.logic.js';
import { Claim } from '../../shared/models/Claim.model.js';
import { ensureWallet } from '../../logics/wallet/wallet.logic.js';
import { NotFoundError } from '../../shared/errors/AppError.js';

export async function claimLead(userId, leadId, idempotencyKey) {
  return claimLeadAtomically({ userId, leadId, idempotencyKey });
}

export async function getExtensionPreview(userId, claimId) {
  const claim = await Claim.findOne({ _id: claimId, userId }).lean();
  if (!claim) throw new NotFoundError('Claim not found');
  const wallet = await ensureWallet(userId);
  const extensionCost = calculateExtensionCost(claim.originalClaimPoints);
  return {
    claimId: claim._id,
    claimCode: claim.claimCode,
    originalClaimPoints: claim.originalClaimPoints,
    extensionDays: 7,
    extensionCost,
    currentBalance: wallet.balancePoints,
    remainingBalance: wallet.balancePoints - extensionCost,
    hasSufficientBalance: wallet.balancePoints >= extensionCost,
    alreadyExtended: claim.extensionCount >= 1,
  };
}

export async function extendClaim(userId, claimId) {
  return extendClaimOwnership({ userId, claimId });
}
