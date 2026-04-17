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

const timeValueSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must use HH:MM format.');

export const updateOperatingHoursSchema = z.object({
  operatingHours: z
    .array(
      z
        .object({
          id: z.string().min(1, 'Operating hour id is required.'),
          dayOfWeek: z.number().int().min(0).max(6),
          opensAt: timeValueSchema,
          closesAt: timeValueSchema,
          isEnabled: z.boolean()
        })
        .superRefine((value, context) => {
          if (value.isEnabled && value.opensAt >= value.closesAt) {
            context.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Closing time must be after opening time.',
              path: ['closesAt']
            });
          }
        })
    )
    .min(1, 'At least one operating hour entry is required.')
});

export const analyticsRangeQuerySchema = z.object({
  range: z.enum(['today', 'week', 'last14days']).optional().default('last14days')
});

export const createAdminUserSchema = z.object({
  displayName: z.string().trim().min(2, 'Display name must be at least 2 characters.').max(80),
  username: z.string().trim().min(3, 'Username must be at least 3 characters.').max(40),
  password: z.string().min(6, 'Password must be at least 6 characters.').max(100)
});

export const adminUserParamsSchema = shopParamsSchema.extend({
  adminUserId: z.string().min(1, 'adminUserId is required.')
});

export const adminUserStatusSchema = z.object({
  isActive: z.boolean()
});

export const updateAdminUserSchema = z.object({
  displayName: z.string().trim().min(2, 'Display name must be at least 2 characters.').max(80),
  username: z.string().trim().min(3, 'Username must be at least 3 characters.').max(40),
  password: z.string().min(6, 'Password must be at least 6 characters.').max(100).optional()
});

export const serviceTypeParamsSchema = shopParamsSchema.extend({
  serviceTypeId: z.string().min(1, 'serviceTypeId is required.')
});

export const updateServiceTypeSchema = z.object({
  name: z.string().trim().min(2, 'Service name must be at least 2 characters.').max(80),
  durationMinutes: z.number().int().min(5, 'Duration must be at least 5 minutes.').max(240),
  priceCents: z.number().int().min(0, 'Price must be zero or more.').max(1000000),
  isActive: z.boolean()
});
