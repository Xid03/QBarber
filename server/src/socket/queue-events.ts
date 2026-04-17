import { getAdminRoom, getShopRoom, getSocketServer } from './socket-server.js';

type QueueSnapshot = {
  currentQueue: number;
  estimatedWait: number;
  nowServing: {
    entryId: string;
    customerName: string;
    service: string;
    barberName: string | null;
  } | null;
  queue: Array<{
    entryId: string;
    position: number;
    estimatedWaitMinutes: number;
  }>;
};

export function emitQueueEvents({
  shopId,
  queueStatus,
  lastAction
}: {
  shopId: string;
  queueStatus: QueueSnapshot;
  lastAction: 'joined' | 'started' | 'completed' | 'left';
}) {
  const io = getSocketServer();
  if (!io) {
    return;
  }
  const payload = {
    shopId,
    queueLength: queueStatus.currentQueue,
    estimatedWaitTime: queueStatus.estimatedWait,
    nowServing: queueStatus.nowServing,
    lastAction
  };

  io.to(getShopRoom(shopId)).emit('queueUpdated', payload);
  io.to(getAdminRoom(shopId)).emit('queueUpdated', payload);

  queueStatus.queue.forEach((entry) => {
    const positionPayload = {
      shopId,
      entryId: entry.entryId,
      newPosition: entry.position,
      estimatedWait: entry.estimatedWaitMinutes
    };

    io.to(getShopRoom(shopId)).emit('positionChanged', positionPayload);
    io.to(getAdminRoom(shopId)).emit('positionChanged', positionPayload);
  });
}

export function emitShopStatusChanged({
  shopId,
  isOpen,
  message
}: {
  shopId: string;
  isOpen: boolean;
  message?: string;
}) {
  const io = getSocketServer();
  if (!io) {
    return;
  }
  const payload = {
    shopId,
    isOpen,
    message
  };

  io.to(getShopRoom(shopId)).emit('shopStatusChanged', payload);
  io.to(getAdminRoom(shopId)).emit('shopStatusChanged', payload);
}
