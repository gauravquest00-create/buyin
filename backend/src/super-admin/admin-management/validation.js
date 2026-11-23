import { z } from 'zod';
import { emailSchema, objectIdSchema } from '../../shared/validators/common.validator.js';

export const createAdminSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: emailSchema,
  password: z.string().min(10).max(100),
  roleId: objectIdSchema,
  customPermissions: z.array(z.string()).default([]),
});

export const updateAdminSchema = z.object({
  fullName: z.string().trim().min(2).max(120).optional(),
  roleId: objectIdSchema.optional(),
  isActive: z.boolean().optional(),
  customPermissions: z.array(z.string()).optional(),
});
