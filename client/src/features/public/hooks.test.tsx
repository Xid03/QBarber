import type { PropsWithChildren } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { createTestQueryClient } from '../../test/utils';
import { apiClient } from '../../api/client';
import { getApiErrorMessage, useJoinQueue, useQueueStatus } from './hooks';

vi.mock('../realtime/hooks', () => ({
  useLiveRefetchInterval: () => false
}));

describe('public hooks', () => {
  it('loads queue status data for a shop', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          shop: {
            id: 'shop-1',
            name: 'YZH Barber',
            status: 'OPEN',
            timezone: 'Asia/Kuala_Lumpur',
            phone: null,
            address: null
          },
          isOpen: true,
          currentQueue: 2,
          estimatedWait: 18,
          nowServing: null,
          busyLevel: 'LOW',
          queue: []
        }
      }
    });

    const queryClient = createTestQueryClient();
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useQueueStatus('shop-1'), { wrapper });

    await waitFor(() => {
      expect(result.current.data?.currentQueue).toBe(2);
    });
  });

  it('posts the queue join payload and invalidates public queries', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          entry: {
            entryId: 'entry-1',
            customerName: 'Aina',
            customerPhone: null,
            serviceTypeId: 'svc-haircut',
            serviceName: 'Haircut',
            position: 3,
            status: 'WAITING',
            estimatedWaitMinutes: 20,
            joinedAt: new Date().toISOString(),
            startedAt: null,
            completedAt: null,
            barberName: null
          },
          peopleAhead: []
        }
      }
    });

    const queryClient = createTestQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useJoinQueue('shop-1'), { wrapper });

    result.current.mutate({
      customerName: 'Aina',
      serviceTypeId: 'svc-haircut'
    });

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith('/shops/shop-1/queue/join', {
        customerName: 'Aina',
        serviceTypeId: 'svc-haircut'
      });
    });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['queue-status', 'shop-1'] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['public-analytics', 'shop-1'] });
    });
  });

  it('pulls the nested server message from axios-style errors', () => {
    const message = getApiErrorMessage({
      response: {
        data: {
          error: {
            message: 'Queue is paused.'
          }
        }
      }
    });

    expect(message).toBe('Queue is paused.');
  });
});
