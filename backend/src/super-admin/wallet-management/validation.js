import { z } from 'zod';
import { objectIdSchema } from '../../shared/validators/common.validator.js';

export const manualAdjustmentSchema = z.object({
  userId: objectIdSchema,
  direction: z.enum(['CREDIT', 'DEBIT']),
  points: z.coerce.number().int().min(1).max(100000),
  reason: z.string().trim().min(5).max(500),
});
