import { io } from 'socket.io-client';
import { getMobileApiBaseUrl } from './api';

let mobileSocket = null;

function getSocketUrl() {
  const envUrl = process.env.EXPO_PUBLIC_SOCKET_URL;

  if (envUrl) {
    return envUrl;
  }

  return getMobileApiBaseUrl().replace(/\/api$/, '');
}

export function getMobileSocket() {
  if (!mobileSocket) {
    mobileSocket = io(getSocketUrl(), {
      transports: ['websocket', 'polling']
    });
  }

  return mobileSocket;
}

export function disconnectMobileSocket() {
  if (mobileSocket) {
    mobileSocket.disconnect();
    mobileSocket = null;
  }
}
