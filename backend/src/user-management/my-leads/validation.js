import { z } from 'zod';
import { LeadStatus } from '../../shared/enums/index.js';

export const updateLeadStatusSchema = z.object({
  status: z.enum(Object.values(LeadStatus)),
  remark: z.string().trim().max(1000).default(''),
});

export const createFollowUpSchema = z.object({
  note: z.string().trim().min(2).max(1000),
  nextFollowUpAt: z.string().datetime().optional().nullable(),
  channel: z.enum(['CALL', 'WHATSAPP', 'EMAIL', 'MEETING', 'OTHER']).default('CALL'),
});

export const createSiteVisitSchema = z.object({
  scheduledAt: z.string().datetime(),
  propertyAddress: z.string().trim().min(3).max(300),
  notes: z.string().trim().max(1000).default(''),
});

export const updateSiteVisitSchema = z.object({
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
  notes: z.string().trim().max(1000).optional(),
});
