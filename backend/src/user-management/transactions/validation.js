import { z } from 'zod';
import { paginationQuerySchema } from '../../shared/validators/common.validator.js';

export const txQuerySchema = paginationQuerySchema.extend({
  type: z.string().trim().optional(),
  direction: z.enum(['CREDIT', 'DEBIT']).optional(),
});
