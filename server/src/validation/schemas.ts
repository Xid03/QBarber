import { z } from 'zod';

export const shopParamsSchema = z.object({
  shopId: z.string().min(1, 'shopId is required.')
});

export const shopSlugParamsSchema = z.object({
  slug: z.string().min(1, 'slug is required.')
});

export const queueEntryParamsSchema = shopParamsSchema.extend({
  entryId: z.string().min(1, 'entryId is required.')
});

export const joinQueueSchema = z.object({
  customerName: z.string().trim().min(2, 'Customer name must be at least 2 characters.').max(80),
  customerPhone: z
    .string()
    .trim()
    .min(8, 'Phone number must be at least 8 characters.')
    .max(20, 'Phone number must be at most 20 characters.')
    .optional(),
  serviceTypeId: z.string().min(1, 'serviceTypeId is required.'),
  barberId: z.string().min(1).optional()
});

export const adminLoginSchema = z.object({
  username: z.string().trim().min(3, 'Username must be at least 3 characters.'),
  password: z.string().min(6, 'Password must be at least 6 characters.')
});

export const startQueueSchema = z.object({
  barberId: z.string().min(1).optional()
});

export const cancelQueueSchema = z.object({
  reason: z.string().trim().min(3).max(160).optional()
});

export const shopStatusSchema = z.object({
  isOpen: z.boolean()
});
