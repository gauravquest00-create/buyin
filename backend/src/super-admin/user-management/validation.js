import { z } from 'zod';
import { UserStatus } from '../../shared/enums/index.js';

export const updateUserStatusSchema = z.object({
  status: z.enum(Object.values(UserStatus)),
  reason: z.string().trim().min(3).max(500),
});
