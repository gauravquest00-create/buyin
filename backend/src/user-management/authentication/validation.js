import { z } from 'zod';
import { emailSchema, indianMobileSchema } from '../../shared/validators/common.validator.js';

export const registerSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  mobile: indianMobileSchema,
  email: emailSchema,
  password: z.string().min(8).max(100),
});

export const sendOtpSchema = z.object({
  mobile: indianMobileSchema,
  purpose: z.enum(['REGISTER', 'PASSWORD_RESET', 'MOBILE_VERIFY']).default('REGISTER'),
});

export const verifyOtpSchema = z.object({
  mobile: indianMobileSchema,
  otp: z.string().trim().regex(/^\d{6}$/, 'OTP must be a 6-digit code'),
  purpose: z.enum(['REGISTER', 'PASSWORD_RESET', 'MOBILE_VERIFY']).default('REGISTER'),
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(3),
  password: z.string().min(1),
});

export const resetPasswordSchema = z.object({
  mobile: indianMobileSchema,
  otp: z.string().trim().regex(/^\d{6}$/),
  newPassword: z.string().min(8).max(100),
});
