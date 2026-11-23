import { z } from 'zod';
import { SupportStatus } from '../../shared/enums/index.js';

export const adminReplyTicketSchema = z.object({
  message: z.string().trim().min(2).max(2000),
  status: z.enum(Object.values(SupportStatus)).optional(),
});
