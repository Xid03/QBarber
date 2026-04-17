import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { apiClient } from '../../api/client';
import { useLiveRefetchInterval } from '../realtime/hooks';
import type {
  EntryStatusData,
  PublicAnalyticsData,
  QueueStatusData,
  ShopMetadata
} from './types';

const defaultShopSlug =
  (import.meta.env.VITE_DEFAULT_SHOP_SLUG as string | undefined) || 'tonys-barbershop';

type ApiSuccess<T> = {
  success: true;
  message?: string;
  data: T;
};

type JoinQueuePayload = {
  customerName: string;
  customerPhone?: string;
  serviceTypeId: string;
  barberId?: string;
};

async function getShopBySlug(slug = defaultShopSlug) {
  const response = await apiClient.get<ApiSuccess<ShopMetadata>>(`/shops/by-slug/${slug}`);
  return response.data.data;
}

async function getQueueStatus(shopId: string) {
  const response = await apiClient.get<ApiSuccess<QueueStatusData>>(`/shops/${shopId}/queue`);
  return response.data.data;
}

async function getEntryStatus(shopId: string, entryId: string) {
  const response = await apiClient.get<ApiSuccess<EntryStatusData>>(`/shops/${shopId}/queue/${entryId}`);
  return response.data.data;
}

async function getPublicAnalytics(shopId: string) {
  const response = await apiClient.get<ApiSuccess<PublicAnalyticsData>>(
    `/shops/${shopId}/analytics/public`
  );
  return response.data.data;
}

async function joinQueue(shopId: string, payload: JoinQueuePayload) {
  const response = await apiClient.post<ApiSuccess<EntryStatusData>>(
    `/shops/${shopId}/queue/join`,
    payload
  );
  return response.data.data;
}

async function leaveQueue(shopId: string, entryId: string) {
  await apiClient.delete(`/shops/${shopId}/queue/${entryId}`);
}

export function getApiErrorMessage(error: unknown) {
  const axiosError = error as AxiosError<{ error?: { message?: string } }>;
  return (
    axiosError.response?.data?.error?.message ||
    axiosError.message ||
    'Something went wrong while talking to QFlow.'
  );
}

export function usePublicShop() {
  return useQuery({
    queryKey: ['public-shop', defaultShopSlug],
    queryFn: () => getShopBySlug(defaultShopSlug),
    staleTime: 60_000
  });
}

export function useQueueStatus(shopId?: string) {
  const refetchInterval = useLiveRefetchInterval(30_000);

  return useQuery({
    queryKey: ['queue-status', shopId],
    queryFn: () => getQueueStatus(shopId as string),
    enabled: Boolean(shopId),
    refetchInterval
  });
}

export function usePublicAnalytics(shopId?: string) {
  const refetchInterval = useLiveRefetchInterval(60_000);

  return useQuery({
    queryKey: ['public-analytics', shopId],
    queryFn: () => getPublicAnalytics(shopId as string),
    enabled: Boolean(shopId),
    refetchInterval
  });
}

export function useEntryStatus(shopId?: string, entryId?: string) {
  const refetchInterval = useLiveRefetchInterval(15_000);

  return useQuery({
    queryKey: ['entry-status', shopId, entryId],
    queryFn: () => getEntryStatus(shopId as string, entryId as string),
    enabled: Boolean(shopId && entryId),
    refetchInterval
  });
}

export function useJoinQueue(shopId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: JoinQueuePayload) => joinQueue(shopId as string, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['queue-status', shopId] });
      await queryClient.invalidateQueries({ queryKey: ['public-analytics', shopId] });
    }
  });
}

export function useLeaveQueue(shopId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (entryId: string) => leaveQueue(shopId as string, entryId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['queue-status', shopId] });
      await queryClient.invalidateQueries({ queryKey: ['public-analytics', shopId] });
    }
  });
}
