import bcrypt from 'bcryptjs';
import type { Request, Response } from 'express';

import { prisma } from '../config/prisma.js';
import { AppError } from '../lib/app-error.js';
import { sendSuccess } from '../lib/http.js';
import { queueService } from '../services/queue-service.js';
import { shopService } from '../services/shop-service.js';
import { emitShopStatusChanged } from '../socket/queue-events.js';

export async function getDashboard(_req: Request, res: Response) {
  const { shopId } = res.locals.validatedParams as { shopId: string };
  const dashboard = await queueService.getDashboardStats(shopId);

  return sendSuccess(res, dashboard);
}

export async function startQueueEntry(_req: Request, res: Response) {
  const { shopId, entryId } = res.locals.validatedParams as { shopId: string; entryId: string };
  const input = (res.locals.validatedBody ?? {}) as { barberId?: string };
  const result = await queueService.markAsInProgress(entryId, input.barberId);

  return sendSuccess(res, { shopId, ...result }, 'Service started.');
}

export async function completeQueueEntry(_req: Request, res: Response) {
  const { entryId } = res.locals.validatedParams as { shopId: string; entryId: string };
  const result = await queueService.markAsCompleted(entryId);

  return sendSuccess(res, result, 'Service completed.');
}

export async function cancelQueueEntry(_req: Request, res: Response) {
  const { entryId } = res.locals.validatedParams as { shopId: string; entryId: string };
  const input = (res.locals.validatedBody ?? {}) as { reason?: string };
  const result = await queueService.cancelEntry(entryId, input.reason ?? 'Cancelled by admin.');

  return sendSuccess(res, result, 'Queue entry cancelled.');
}

export async function manualAddQueueEntry(_req: Request, res: Response) {
  const { shopId } = res.locals.validatedParams as { shopId: string };
  const input = res.locals.validatedBody as {
    customerName: string;
    customerPhone?: string;
    serviceTypeId: string;
    barberId?: string;
  };
  const result = await queueService.addToQueue(shopId, input);

  return sendSuccess(res, result, 'Customer added to queue.', 201);
}

export async function getDetailedAnalytics(_req: Request, res: Response) {
  const { shopId } = res.locals.validatedParams as { shopId: string };
  const { range } = (res.locals.validatedQuery ?? { range: 'last14days' }) as {
    range?: 'today' | 'week' | 'last14days';
  };
  const analytics = await queueService.getDetailedAnalytics(shopId, range ?? 'last14days');

  return sendSuccess(res, analytics);
}

export async function getShopSettings(_req: Request, res: Response) {
  const { shopId } = res.locals.validatedParams as { shopId: string };
  const shop = await shopService.getShopDetails(shopId);

  return sendSuccess(res, {
    id: shop.id,
    name: shop.name,
    slug: shop.slug,
    status: shop.status,
    timezone: shop.timezone,
    phone: shop.phone,
    address: shop.address,
    admins: shop.adminUsers.map((adminUser) => ({
      id: adminUser.id,
      username: adminUser.username,
      displayName: adminUser.displayName,
      role: adminUser.role
    })),
    serviceTypes: shop.serviceTypes,
    barbers: shop.barbers,
    operatingHours: shop.operatingHours
  });
}

export async function updateOperatingHours(_req: Request, res: Response) {
  const { shopId } = res.locals.validatedParams as { shopId: string };
  const { operatingHours } = res.locals.validatedBody as {
    operatingHours: Array<{
      id: string;
      dayOfWeek: number;
      opensAt: string;
      closesAt: string;
      isEnabled: boolean;
    }>;
  };

  const updatedHours = await shopService.updateOperatingHours(shopId, operatingHours);

  return sendSuccess(res, updatedHours, 'Operating hours updated.');
}

export async function createAdminUser(_req: Request, res: Response) {
  const { shopId } = res.locals.validatedParams as { shopId: string };
  const { displayName, username, password } = res.locals.validatedBody as {
    displayName: string;
    username: string;
    password: string;
  };

  await shopService.ensureShopExists(shopId);

  const existingAdmin = await prisma.adminUser.findUnique({
    where: {
      username
    }
  });

  if (existingAdmin) {
    throw new AppError(409, 'USERNAME_TAKEN', 'That username is already in use.');
  }

  const adminUser = await prisma.adminUser.create({
    data: {
      shopId,
      displayName: displayName.trim(),
      username: username.trim(),
      passwordHash: await bcrypt.hash(password, 10)
    }
  });

  return sendSuccess(
    res,
    {
      id: adminUser.id,
      username: adminUser.username,
      displayName: adminUser.displayName,
      role: adminUser.role
    },
    'Admin user created.',
    201
  );
}

export async function updateAdminUser(_req: Request, res: Response) {
  const { shopId, adminUserId } = res.locals.validatedParams as { shopId: string; adminUserId: string };
  const { displayName, username, password } = res.locals.validatedBody as {
    displayName: string;
    username: string;
    password?: string;
  };

  const adminUser = await prisma.adminUser.findFirst({
    where: {
      id: adminUserId,
      shopId
    }
  });

  if (!adminUser) {
    throw new AppError(404, 'ADMIN_USER_NOT_FOUND', 'Admin user not found.');
  }

  const normalizedUsername = username.trim();
  const existingAdmin = await prisma.adminUser.findFirst({
    where: {
      username: normalizedUsername,
      NOT: {
        id: adminUser.id
      }
    }
  });

  if (existingAdmin) {
    throw new AppError(409, 'USERNAME_TAKEN', 'That username is already in use.');
  }

  const updatedAdmin = await prisma.adminUser.update({
    where: {
      id: adminUser.id
    },
    data: {
      displayName: displayName.trim(),
      username: normalizedUsername,
      ...(password ? { passwordHash: await bcrypt.hash(password, 10) } : {})
    }
  });

  return sendSuccess(
    res,
    {
      id: updatedAdmin.id,
      username: updatedAdmin.username,
      displayName: updatedAdmin.displayName,
      role: updatedAdmin.role
    },
    'Admin updated.'
  );
}

export async function toggleAdminUserStatus(_req: Request, res: Response) {
  const { shopId, adminUserId } = res.locals.validatedParams as { shopId: string; adminUserId: string };
  const { isActive } = res.locals.validatedBody as { isActive: boolean };
  const currentAdmin = res.locals.admin as { sub: string };

  const adminUser = await prisma.adminUser.findFirst({
    where: {
      id: adminUserId,
      shopId
    }
  });

  if (!adminUser) {
    throw new AppError(404, 'ADMIN_USER_NOT_FOUND', 'Admin user not found.');
  }

  if (adminUser.id === currentAdmin.sub && !isActive) {
    throw new AppError(409, 'CANNOT_DEACTIVATE_SELF', 'You cannot deactivate your own admin account.');
  }

  if (!isActive) {
    const activeAdminCount = await prisma.adminUser.count({
      where: {
        shopId,
        NOT: {
          role: 'INACTIVE'
        }
      }
    });

    if (activeAdminCount <= 1) {
      throw new AppError(409, 'LAST_ACTIVE_ADMIN', 'At least one active admin must remain.');
    }
  }

  const updatedAdmin = await prisma.adminUser.update({
    where: {
      id: adminUser.id
    },
    data: {
      role: isActive ? 'ADMIN' : 'INACTIVE'
    }
  });

  return sendSuccess(
    res,
    {
      id: updatedAdmin.id,
      username: updatedAdmin.username,
      displayName: updatedAdmin.displayName,
      role: updatedAdmin.role
    },
    `Admin ${isActive ? 'activated' : 'deactivated'}.`
  );
}

export async function deleteAdminUser(_req: Request, res: Response) {
  const { shopId, adminUserId } = res.locals.validatedParams as { shopId: string; adminUserId: string };
  const currentAdmin = res.locals.admin as { sub: string };

  const adminUser = await prisma.adminUser.findFirst({
    where: {
      id: adminUserId,
      shopId
    }
  });

  if (!adminUser) {
    throw new AppError(404, 'ADMIN_USER_NOT_FOUND', 'Admin user not found.');
  }

  if (adminUser.id === currentAdmin.sub) {
    throw new AppError(409, 'CANNOT_DELETE_SELF', 'You cannot delete your own admin account.');
  }

  const activeAdminCount = await prisma.adminUser.count({
    where: {
      shopId,
      NOT: {
        role: 'INACTIVE'
      }
    }
  });

  if (adminUser.role !== 'INACTIVE' && activeAdminCount <= 1) {
    throw new AppError(409, 'LAST_ACTIVE_ADMIN', 'At least one active admin must remain.');
  }

  await prisma.adminUser.delete({
    where: {
      id: adminUser.id
    }
  });

  return sendSuccess(
    res,
    {
      id: adminUser.id
    },
    'Admin deleted.'
  );
}

export async function updateShopStatus(_req: Request, res: Response) {
  const { shopId } = res.locals.validatedParams as { shopId: string };
  const { isOpen } = res.locals.validatedBody as { isOpen: boolean };
  const shop = await shopService.updateShopStatus(shopId, isOpen);
  const message = `Shop marked as ${isOpen ? 'open' : 'closed'}.`;

  emitShopStatusChanged({
    shopId: shop.id,
    isOpen,
    message
  });

  return sendSuccess(
    res,
    {
      id: shop.id,
      status: shop.status
    },
    message
  );
}

export async function updateServiceType(_req: Request, res: Response) {
  const { shopId, serviceTypeId } = res.locals.validatedParams as { shopId: string; serviceTypeId: string };
  const { name, durationMinutes, priceCents, isActive } = res.locals.validatedBody as {
    name: string;
    durationMinutes: number;
    priceCents: number;
    isActive: boolean;
  };

  const serviceType = await prisma.serviceType.findFirst({
    where: {
      id: serviceTypeId,
      shopId
    }
  });

  if (!serviceType) {
    throw new AppError(404, 'SERVICE_TYPE_NOT_FOUND', 'Service type not found.');
  }

  const normalizedName = name.trim();
  const existingService = await prisma.serviceType.findFirst({
    where: {
      shopId,
      name: normalizedName,
      NOT: {
        id: serviceType.id
      }
    }
  });

  if (existingService) {
    throw new AppError(409, 'SERVICE_NAME_TAKEN', 'That service name is already in use.');
  }

  const updatedServiceType = await prisma.serviceType.update({
    where: {
      id: serviceType.id
    },
    data: {
      name: normalizedName,
      durationMinutes,
      priceCents,
      isActive
    }
  });

  return sendSuccess(
    res,
    {
      id: updatedServiceType.id,
      name: updatedServiceType.name,
      durationMinutes: updatedServiceType.durationMinutes,
      priceCents: updatedServiceType.priceCents,
      isActive: updatedServiceType.isActive
    },
    'Service updated.'
  );
}
