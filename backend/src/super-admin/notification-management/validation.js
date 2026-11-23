import { z } from 'zod';

export const broadcastNotificationSchema = z.object({
  title: z.string().trim().min(3).max(150),
  message: z.string().trim().min(5).max(1000),
  targetUserIds: z.array(z.string()).optional(),
});
