import { z } from 'zod';

export const upsertRoleSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(300).default(''),
  permissions: z.array(z.string()).min(1),
});
