import { z } from 'zod';

export const revokeClaimSchema = z.object({
  reason: z.string().trim().min(5).max(500),
  returnLeadToPool: z.boolean().default(true),
});
