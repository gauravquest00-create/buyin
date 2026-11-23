import { z } from 'zod';
import { objectIdSchema } from '../../shared/validators/common.validator.js';

export const createClaimSchema = z.object({
  leadId: objectIdSchema,
});
