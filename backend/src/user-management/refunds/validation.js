import { z } from 'zod';
import { RefundReason } from '../../shared/enums/index.js';
import { objectIdSchema } from '../../shared/validators/common.validator.js';

export const createRefundSchema = z.object({
  claimId: objectIdSchema,
  reason: z.enum(Object.values(RefundReason)),
  description: z.string().trim().min(10).max(2000),
});

export const respondInfoSchema = z.object({
  additionalInfo: z.string().trim().min(5).max(2000),
});
