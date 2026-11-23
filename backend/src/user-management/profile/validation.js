import { z } from 'zod';

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(120).optional(),
  professionalRole: z.string().trim().max(80).optional(),
  agencyName: z.string().trim().max(120).optional(),
  experienceYears: z.coerce.number().min(0).max(60).optional(),
  city: z.string().trim().max(80).optional(),
  workingLocations: z.array(z.string().trim().min(1)).max(25).optional(),
  languages: z.array(z.string().trim().min(1)).max(15).optional(),
  reraNumber: z.string().trim().max(60).optional(),
  propertyPreferences: z.array(z.string().trim()).max(15).optional(),
  budgetPreferences: z.array(z.string().trim()).max(10).optional(),
});
