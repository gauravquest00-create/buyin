import { z } from 'zod';
import { paginationQuerySchema } from '../../shared/validators/common.validator.js';

export const leadPoolQuerySchema = paginationQuerySchema.extend({
  city: z.string().trim().optional(),
  location: z.string().trim().optional(),
  budgetBand: z.string().trim().optional(),
  propertyType: z.string().trim().optional(),
  poolFilter: z.enum(['ALL', 'FRESH', 'RETURNED', 'VISITED']).default('ALL'),
});
