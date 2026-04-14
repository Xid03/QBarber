import { io } from 'socket.io-client';
import { getWebApiBaseUrl } from './api';

let adminSocket = null;

function getSocketUrl() {
  const envUrl = import.meta.env.VITE_SOCKET_URL;

  if (envUrl) {
    return envUrl;
  }

  return getWebApiBaseUrl().replace(/\/api$/, '');
}

export function getAdminSocket() {
  if (!adminSocket) {
    adminSocket = io(getSocketUrl(), {
      transports: ['websocket', 'polling']
    });
  }

  return adminSocket;
}

export function disconnectAdminSocket() {
  if (adminSocket) {
    adminSocket.disconnect();
    adminSocket = null;
  }
}
