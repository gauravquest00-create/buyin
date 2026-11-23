import { z } from 'zod';

export const createCategorySchema = z.object({
  type: z.enum(['CITY', 'LOCATION', 'PROPERTY_TYPE', 'CONFIGURATION']),
  name: z.string().trim().min(2).max(100),
  parentName: z.string().trim().max(100).default(''),
  sortOrder: z.coerce.number().default(0),
});
