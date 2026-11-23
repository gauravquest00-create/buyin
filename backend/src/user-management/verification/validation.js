import { z } from 'zod';

export const submitVerificationSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  professionalRole: z.string().trim().min(2).max(80),
  agencyName: z.string().trim().max(120).default(''),
  experienceYears: z.coerce.number().min(0).max(60),
  city: z.string().trim().min(2).max(80),
  workingLocations: z.union([z.array(z.string()), z.string()]).transform((v) =>
    Array.isArray(v) ? v : v.split(',').map((s) => s.trim()).filter(Boolean)
  ),
  languages: z.union([z.array(z.string()), z.string()]).transform((v) =>
    Array.isArray(v) ? v : v.split(',').map((s) => s.trim()).filter(Boolean)
  ),
  reraNumber: z.string().trim().max(60).optional().default(''),
  docType: z.string().trim().default('IDENTITY_OR_RERA'),
});
