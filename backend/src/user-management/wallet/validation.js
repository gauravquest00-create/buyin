import { z } from 'zod';

export const customQuoteSchema = z.object({
  amountInr: z.coerce.number().min(500, 'Minimum custom recharge is ₹500').max(500000),
});
