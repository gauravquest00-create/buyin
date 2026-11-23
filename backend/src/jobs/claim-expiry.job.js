import { processExpiredClaimsAndReturnLeads } from '../logics/claim/claim.logic.js';
import { logger } from '../shared/utils/logger.js';

export async function runClaimExpiryJob() {
  const result = await processExpiredClaimsAndReturnLeads(new Date());
  logger.info('Claim expiry job completed', result);
  return result;
}
