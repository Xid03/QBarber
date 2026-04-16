import { z } from 'zod';

export const joinQueueSchema = z.object({
  customerName: z.string().min(2).max(80),
  customerPhone: z.string().min(8).max(20).optional(),
  serviceTypeId: z.string().min(1)
});

export const adminLoginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6)
});
