import { z } from 'zod';
import { RefundLeadOutcome } from '../../shared/enums/index.js';

export const approveRefundSchema = z.object({
  leadOutcome: z.enum(Object.values(RefundLeadOutcome)),
  adminRemarks: z.string().trim().max(1000).default(''),
});

export const rejectRefundSchema = z.object({
  adminRemarks: z.string().trim().min(5).max(1000),
});

export const requestInfoSchema = z.object({
  adminRemarks: z.string().trim().min(5).max(1000),
});
