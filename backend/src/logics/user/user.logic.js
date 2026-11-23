import { UserStatus, VerificationStatus } from '../../shared/enums/index.js';

export function canUserClaimLeads(user) {
  if (!user) return { allowed: false, reason: 'User not authenticated' };
  if (user.status === UserStatus.SUSPENDED) {
    return { allowed: false, reason: 'Account is suspended' };
  }
  if (user.status === UserStatus.RESTRICTED) {
    return { allowed: false, reason: 'Account claiming access is restricted' };
  }
  if (user.verificationStatus !== VerificationStatus.APPROVED) {
    return { allowed: false, reason: 'Complete professional verification to unlock lead claiming' };
  }
  return { allowed: true, reason: null };
}
