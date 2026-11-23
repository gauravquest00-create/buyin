import { z } from 'zod';
import { emailSchema } from '../../shared/validators/common.validator.js';

export const adminLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
  totpCode: z.string().trim().regex(/^\d{6}$/).optional(),
});

export const mfaVerifySchema = z.object({
  totpCode: z.string().trim().regex(/^\d{6}$/, 'Enter a 6-digit authenticator code'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(10, 'Admin password must be at least 10 characters').max(100),
});
