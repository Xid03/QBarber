import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useSocketContext, type LiveConnectionState } from './socket-provider';

type QueueUpdatedPayload = {
  shopId: string;
  queueLength: number;
  estimatedWaitTime: number;
  lastAction: 'joined' | 'started' | 'completed' | 'left';
};

type PositionChangedPayload = {
  shopId: string;
  entryId: string;
  newPosition: number;
  estimatedWait: number;
};

type ShopStatusChangedPayload = {
  shopId: string;
  isOpen: boolean;
  message?: string;
};

export function useRealtimeShopSync({
  shopId,
  entryId,
  audience
}: {
  shopId?: string;
  entryId?: string;
  audience: 'public' | 'admin';
}) {
  const { socket, connectionState } = useSocketContext();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket || !shopId) {
      return;
    }

    const roomEvent = audience === 'admin' ? 'joinAdminRoom' : 'joinShopRoom';

    const syncQueueQueries = async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['queue-status', shopId] }),
        queryClient.invalidateQueries({ queryKey: ['public-analytics', shopId] }),
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard', shopId] }),
        queryClient.invalidateQueries({ queryKey: ['admin-queue', shopId] }),
        queryClient.invalidateQueries({ queryKey: ['admin-analytics', shopId] })
      ]);
    };

    const syncStatusQueries = async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['public-shop'] }),
        queryClient.invalidateQueries({ queryKey: ['queue-status', shopId] }),
        queryClient.invalidateQueries({ queryKey: ['admin-settings', shopId] }),
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard', shopId] }),
        queryClient.invalidateQueries({ queryKey: ['admin-queue', shopId] })
      ]);
    };

    const handleConnect = () => {
      socket.emit(roomEvent, shopId);
      void syncQueueQueries();
      void syncStatusQueries();
    };

    const handleQueueUpdated = (payload: QueueUpdatedPayload) => {
      if (payload.shopId !== shopId) {
        return;
      }

      void syncQueueQueries();
    };

    const handlePositionChanged = (payload: PositionChangedPayload) => {
      if (payload.shopId !== shopId || !entryId || payload.entryId !== entryId) {
        return;
      }

      void queryClient.invalidateQueries({ queryKey: ['entry-status', shopId, entryId] });
    };

    const handleShopStatusChanged = (payload: ShopStatusChangedPayload) => {
      if (payload.shopId !== shopId) {
        return;
      }

      void syncStatusQueries();
    };

    if (socket.connected) {
      socket.emit(roomEvent, shopId);
    }

    socket.on('connect', handleConnect);
    socket.on('queueUpdated', handleQueueUpdated);
    socket.on('positionChanged', handlePositionChanged);
    socket.on('shopStatusChanged', handleShopStatusChanged);

    return () => {
      socket.emit('leaveRoom', shopId);
      socket.off('connect', handleConnect);
      socket.off('queueUpdated', handleQueueUpdated);
      socket.off('positionChanged', handlePositionChanged);
      socket.off('shopStatusChanged', handleShopStatusChanged);
    };
  }, [audience, entryId, queryClient, shopId, socket]);

  return {
    connectionState
  };
}

export function useLiveRefetchInterval(intervalMs: number) {
  const { connectionState } = useSocketContext();
  return connectionState === 'live' ? false : intervalMs;
}

export function useConnectionState(): LiveConnectionState {
  const { connectionState } = useSocketContext();
  return connectionState;
}
