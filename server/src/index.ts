import http from 'node:http';

import { Server } from 'socket.io';

import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { prisma } from './config/prisma.js';

const app = createApp();
const server = http.createServer(app);
const allowedOrigins = env.CLIENT_URL.split(',').map((origin) => origin.trim());

const io = new Server(server, {
  cors: {
    origin: allowedOrigins
  }
});

io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);
});

async function bootstrap() {
  await prisma.$connect();

  server.listen(env.PORT, () => {
    logger.info(`QFlow API listening on port ${env.PORT}`);
  });
}

void bootstrap().catch((error) => {
  logger.error(`Failed to start QFlow API: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});

async function shutdown(signal: string) {
  logger.info(`Received ${signal}. Shutting down gracefully.`);
  await prisma.$disconnect();
  server.close(() => {
    process.exit(0);
  });
}

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});
