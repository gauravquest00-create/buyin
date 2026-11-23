import { z } from 'zod';

export const createOrderSchema = z
  .object({
    packageCode: z.string().trim().optional(),
    customAmountInr: z.coerce.number().min(500).max(500000).optional(),
  })
  .refine((d) => Boolean(d.packageCode || d.customAmountInr), {
    message: 'Provide either packageCode or customAmountInr (minimum ₹500)',
  });

export const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string().min(5),
  razorpayPaymentId: z.string().min(5),
  razorpaySignature: z.string().min(10),
});
