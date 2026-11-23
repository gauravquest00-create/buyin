import { z } from 'zod';

export const createTicketSchema = z.object({
  subject: z.string().trim().min(4).max(200),
  category: z.enum(['WALLET', 'CLAIM', 'REFUND', 'VERIFICATION', 'TECHNICAL', 'OTHER']).default('OTHER'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  message: z.string().trim().min(5).max(2000),
});

export const replyTicketSchema = z.object({
  message: z.string().trim().min(2).max(2000),
});
