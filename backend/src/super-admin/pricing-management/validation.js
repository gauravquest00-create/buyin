import { z } from 'zod';

export const updatePricingSchema = z.object({
  budgetBasePoints: z.record(z.string(), z.coerce.number().min(1)),
  propertyTypeAdditions: z.record(z.string(), z.coerce.number().min(0)),
  buyerSignals: z.record(z.string(), z.coerce.number().min(0)),
  siteVisitPremiums: z.record(z.string(), z.coerce.number().min(0)),
  returnedLeadDiscounts: z.record(z.string(), z.any()),
  changeNotes: z.string().trim().max(500).default('Pricing rules updated'),
});
