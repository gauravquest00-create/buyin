import { z } from 'zod';

export const updateSettingSchema = z.object({
  key: z.string().trim().min(2).max(100),
  value: z.any(),
  description: z.string().trim().max(300).optional(),
});
