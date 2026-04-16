import http from 'node:http';

import { Server } from 'socket.io';

import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';

const app = createApp();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: env.CLIENT_URL
  }
});

io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);
});

server.listen(env.PORT, () => {
  logger.info(`QFlow placeholder API listening on port ${env.PORT}`);
});
