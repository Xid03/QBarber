import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '../../api/client';
import type { QueueStatusData } from '../public/types';
import type { AdminAnalyticsData, AdminDashboardData, AdminSession, AdminSettingsData } from './types';

type ApiSuccess<T> = {
  success: true;
  message?: string;
  data: T;
};

function authHeader(token: string) {
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
}

export async function loginAdmin(input: { username: string; password: string }) {
  const response = await apiClient.post<ApiSuccess<AdminSession>>('/admin/auth/login', input);
  return response.data.data;
}

async function getAdminDashboard(shopId: string, token: string) {
  const response = await apiClient.get<ApiSuccess<AdminDashboardData>>(
    `/admin/shops/${shopId}/dashboard`,
    authHeader(token)
  );
  return response.data.data;
}

async function getAdminQueue(shopId: string) {
  const response = await apiClient.get<ApiSuccess<QueueStatusData>>(`/shops/${shopId}/queue`);
  return response.data.data;
}

async function startQueueEntry(shopId: string, entryId: string, token: string) {
  const response = await apiClient.put<ApiSuccess<unknown>>(
    `/admin/shops/${shopId}/queue/${entryId}/start`,
    {},
    authHeader(token)
  );
  return response.data.data;
}

async function completeQueueEntry(shopId: string, entryId: string, token: string) {
  const response = await apiClient.put<ApiSuccess<unknown>>(
    `/admin/shops/${shopId}/queue/${entryId}/complete`,
    {},
    authHeader(token)
  );
  return response.data.data;
}

async function cancelQueueEntry(shopId: string, entryId: string, token: string) {
  const response = await apiClient.put<ApiSuccess<unknown>>(
    `/admin/shops/${shopId}/queue/${entryId}/cancel`,
    {
      reason: 'Cancelled by admin dashboard.'
    },
    authHeader(token)
  );
  return response.data.data;
}

async function manualAddQueue(
  shopId: string,
  token: string,
  payload: {
    customerName: string;
    customerPhone?: string;
    serviceTypeId: string;
  }
) {
  const response = await apiClient.post<ApiSuccess<unknown>>(
    `/admin/shops/${shopId}/queue/manual-add`,
    payload,
    authHeader(token)
  );
  return response.data.data;
}

async function getAdminAnalytics(shopId: string, token: string) {
  const response = await apiClient.get<ApiSuccess<AdminAnalyticsData>>(
    `/admin/shops/${shopId}/analytics/detailed`,
    authHeader(token)
  );
  return response.data.data;
}

async function getSettings(shopId: string, token: string) {
  const response = await apiClient.get<ApiSuccess<AdminSettingsData>>(
    `/admin/shops/${shopId}/settings`,
    authHeader(token)
  );
  return response.data.data;
}

async function updateShopStatus(shopId: string, token: string, isOpen: boolean) {
  const response = await apiClient.put<ApiSuccess<{ id: string; status: 'OPEN' | 'CLOSED' }>>(
    `/admin/shops/${shopId}/status`,
    { isOpen },
    authHeader(token)
  );
  return response.data.data;
}

export function getAdminApiErrorMessage(error: unknown) {
  const maybeMessage =
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error
      ?.message === 'string'
      ? (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error
          ?.message
      : null;

  if (maybeMessage) {
    return maybeMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'The admin request could not be completed.';
}

export function useAdminDashboard(shopId?: string, token?: string) {
  return useQuery({
    queryKey: ['admin-dashboard', shopId],
    queryFn: () => getAdminDashboard(shopId as string, token as string),
    enabled: Boolean(shopId && token),
    refetchInterval: 30_000
  });
}

export function useAdminQueue(shopId?: string) {
  return useQuery({
    queryKey: ['admin-queue', shopId],
    queryFn: () => getAdminQueue(shopId as string),
    enabled: Boolean(shopId),
    refetchInterval: 15_000
  });
}

export function useQueueActions(shopId?: string, token?: string) {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard', shopId] }),
      queryClient.invalidateQueries({ queryKey: ['admin-queue', shopId] }),
      queryClient.invalidateQueries({ queryKey: ['admin-analytics', shopId] })
    ]);
  };

  return {
    startMutation: useMutation({
      mutationFn: (entryId: string) => startQueueEntry(shopId as string, entryId, token as string),
      onSuccess: invalidate
    }),
    completeMutation: useMutation({
      mutationFn: (entryId: string) => completeQueueEntry(shopId as string, entryId, token as string),
      onSuccess: invalidate
    }),
    cancelMutation: useMutation({
      mutationFn: (entryId: string) => cancelQueueEntry(shopId as string, entryId, token as string),
      onSuccess: invalidate
    }),
    manualAddMutation: useMutation({
      mutationFn: (payload: { customerName: string; customerPhone?: string; serviceTypeId: string }) =>
        manualAddQueue(shopId as string, token as string, payload),
      onSuccess: invalidate
    })
  };
}

export function useAnalyticsData(shopId?: string, token?: string) {
  return useQuery({
    queryKey: ['admin-analytics', shopId],
    queryFn: () => getAdminAnalytics(shopId as string, token as string),
    enabled: Boolean(shopId && token)
  });
}

export function useSettings(shopId?: string, token?: string) {
  const queryClient = useQueryClient();

  return {
    settingsQuery: useQuery({
      queryKey: ['admin-settings', shopId],
      queryFn: () => getSettings(shopId as string, token as string),
      enabled: Boolean(shopId && token)
    }),
    updateStatusMutation: useMutation({
      mutationFn: (isOpen: boolean) => updateShopStatus(shopId as string, token as string, isOpen),
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['admin-settings', shopId] }),
          queryClient.invalidateQueries({ queryKey: ['admin-dashboard', shopId] }),
          queryClient.invalidateQueries({ queryKey: ['admin-queue', shopId] })
        ]);
      }
    })
  };
}
