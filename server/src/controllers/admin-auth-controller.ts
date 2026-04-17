import bcrypt from 'bcryptjs';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { AppError } from '../lib/app-error.js';
import { sendSuccess } from '../lib/http.js';

export async function loginAdmin(_req: Request, res: Response) {
  const { username, password } = res.locals.validatedBody as {
    username: string;
    password: string;
  };

  const adminUser = await prisma.adminUser.findUnique({
    where: {
      username
    },
    include: {
      shop: true
    }
  });

  if (!adminUser) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid username or password.');
  }

  if (adminUser.role === 'INACTIVE') {
    throw new AppError(403, 'ACCOUNT_INACTIVE', 'This admin account has been deactivated.');
  }

  const isPasswordValid = await bcrypt.compare(password, adminUser.passwordHash);

  if (!isPasswordValid) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid username or password.');
  }

  const token = jwt.sign(
    {
      sub: adminUser.id,
      shopId: adminUser.shopId,
      username: adminUser.username,
      role: adminUser.role
    },
    env.JWT_SECRET,
    {
      expiresIn: '12h'
    }
  );

  return sendSuccess(
    res,
    {
      token,
      admin: {
        id: adminUser.id,
        username: adminUser.username,
        displayName: adminUser.displayName,
        role: adminUser.role
      },
      shop: {
        id: adminUser.shop.id,
        name: adminUser.shop.name
      }
    },
    'Login successful.'
  );
}
