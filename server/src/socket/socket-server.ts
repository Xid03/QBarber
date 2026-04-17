import type { Server as HttpServer } from 'node:http';

import { Server } from 'socket.io';

import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

let io: Server | null = null;

export function createSocketServer(server: HttpServer) {
  const allowedOrigins = env.CLIENT_URL.split(',').map((origin) => origin.trim());

  io = new Server(server, {
    cors: {
      origin: allowedOrigins
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    socket.on('joinShopRoom', (shopId: string) => {
      if (!shopId) {
        return;
      }

      void socket.join(getShopRoom(shopId));
      logger.info(`Socket ${socket.id} joined public room for shop ${shopId}`);
    });

    socket.on('joinAdminRoom', (shopId: string) => {
      if (!shopId) {
        return;
      }

      void socket.join(getAdminRoom(shopId));
      logger.info(`Socket ${socket.id} joined admin room for shop ${shopId}`);
    });

    socket.on('leaveRoom', (shopId: string) => {
      if (!shopId) {
        return;
      }

      void socket.leave(getShopRoom(shopId));
      void socket.leave(getAdminRoom(shopId));
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getSocketServer() {
  return io;
}

export function getShopRoom(shopId: string) {
  return `shop:${shopId}`;
}

export function getAdminRoom(shopId: string) {
  return `admin:${shopId}`;
}
