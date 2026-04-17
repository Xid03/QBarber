import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '../../api/client';
import { useLiveRefetchInterval } from '../realtime/hooks';
import type { QueueStatusData } from '../public/types';
import type {
  AdminAnalyticsData,
  AdminAnalyticsRange,
  AdminDashboardData,
  AdminSession,
  AdminSettingsData
} from './types';

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

async function getAdminAnalytics(shopId: string, token: string, range: AdminAnalyticsRange) {
  const response = await apiClient.get<ApiSuccess<AdminAnalyticsData>>(
    `/admin/shops/${shopId}/analytics/detailed`,
    {
      ...authHeader(token),
      params: {
        range
      }
    }
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

async function updateOperatingHours(
  shopId: string,
  token: string,
  payload: {
    operatingHours: Array<{
      id: string;
      dayOfWeek: number;
      opensAt: string;
      closesAt: string;
      isEnabled: boolean;
    }>;
  }
) {
  const response = await apiClient.put<
    ApiSuccess<
      Array<{
        id: string;
        dayOfWeek: number;
        opensAt: string;
        closesAt: string;
        isEnabled: boolean;
      }>
    >
  >(`/admin/shops/${shopId}/operating-hours`, payload, authHeader(token));
  return response.data.data;
}

async function createAdminUser(
  shopId: string,
  token: string,
  payload: {
    displayName: string;
    username: string;
    password: string;
  }
) {
  const response = await apiClient.post<
    ApiSuccess<{
      id: string;
      username: string;
      displayName: string;
      role: string;
    }>
  >(`/admin/shops/${shopId}/admin-users`, payload, authHeader(token));
  return response.data.data;
}

async function updateAdminUser(
  shopId: string,
  token: string,
  adminUserId: string,
  payload: {
    displayName: string;
    username: string;
    password?: string;
  }
) {
  const response = await apiClient.put<
    ApiSuccess<{
      id: string;
      username: string;
      displayName: string;
      role: string;
    }>
  >(`/admin/shops/${shopId}/admin-users/${adminUserId}`, payload, authHeader(token));
  return response.data.data;
}

async function updateAdminUserStatus(
  shopId: string,
  token: string,
  adminUserId: string,
  isActive: boolean
) {
  const response = await apiClient.put<
    ApiSuccess<{
      id: string;
      username: string;
      displayName: string;
      role: string;
    }>
  >(`/admin/shops/${shopId}/admin-users/${adminUserId}/status`, { isActive }, authHeader(token));
  return response.data.data;
}

async function deleteAdminUser(shopId: string, token: string, adminUserId: string) {
  const response = await apiClient.delete<ApiSuccess<{ id: string }>>(
    `/admin/shops/${shopId}/admin-users/${adminUserId}`,
    authHeader(token)
  );
  return response.data.data;
}

async function updateServiceType(
  shopId: string,
  token: string,
  serviceTypeId: string,
  payload: {
    name: string;
    durationMinutes: number;
    priceCents: number;
    isActive: boolean;
  }
) {
  const response = await apiClient.put<
    ApiSuccess<{
      id: string;
      name: string;
      durationMinutes: number;
      priceCents: number;
      isActive: boolean;
    }>
  >(`/admin/shops/${shopId}/service-types/${serviceTypeId}`, payload, authHeader(token));
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
  const refetchInterval = useLiveRefetchInterval(30_000);

  return useQuery({
    queryKey: ['admin-dashboard', shopId],
    queryFn: () => getAdminDashboard(shopId as string, token as string),
    enabled: Boolean(shopId && token),
    refetchInterval
  });
}

export function useAdminQueue(shopId?: string) {
  const refetchInterval = useLiveRefetchInterval(15_000);

  return useQuery({
    queryKey: ['admin-queue', shopId],
    queryFn: () => getAdminQueue(shopId as string),
    enabled: Boolean(shopId),
    refetchInterval
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

export function useAnalyticsData(shopId?: string, token?: string, range: AdminAnalyticsRange = 'last14days') {
  return useQuery({
    queryKey: ['admin-analytics', shopId, range],
    queryFn: () => getAdminAnalytics(shopId as string, token as string, range),
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
    }),
    updateOperatingHoursMutation: useMutation({
      mutationFn: (payload: {
        operatingHours: Array<{
          id: string;
          dayOfWeek: number;
          opensAt: string;
          closesAt: string;
          isEnabled: boolean;
        }>;
      }) => updateOperatingHours(shopId as string, token as string, payload),
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['admin-settings', shopId] }),
          queryClient.invalidateQueries({ queryKey: ['admin-dashboard', shopId] }),
          queryClient.invalidateQueries({ queryKey: ['admin-queue', shopId] })
        ]);
      }
    }),
    createAdminMutation: useMutation({
      mutationFn: (payload: { displayName: string; username: string; password: string }) =>
        createAdminUser(shopId as string, token as string, payload),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ['admin-settings', shopId] });
      }
    }),
    updateAdminMutation: useMutation({
      mutationFn: ({
        adminUserId,
        payload
      }: {
        adminUserId: string;
        payload: { displayName: string; username: string; password?: string };
      }) => updateAdminUser(shopId as string, token as string, adminUserId, payload),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ['admin-settings', shopId] });
      }
    }),
    updateAdminStatusMutation: useMutation({
      mutationFn: ({ adminUserId, isActive }: { adminUserId: string; isActive: boolean }) =>
        updateAdminUserStatus(shopId as string, token as string, adminUserId, isActive),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ['admin-settings', shopId] });
      }
    }),
    deleteAdminMutation: useMutation({
      mutationFn: (adminUserId: string) => deleteAdminUser(shopId as string, token as string, adminUserId),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ['admin-settings', shopId] });
      }
    }),
    updateServiceTypeMutation: useMutation({
      mutationFn: ({
        serviceTypeId,
        payload
      }: {
        serviceTypeId: string;
        payload: { name: string; durationMinutes: number; priceCents: number; isActive: boolean };
      }) => updateServiceType(shopId as string, token as string, serviceTypeId, payload),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ['admin-settings', shopId] });
      }
    })
  };
}
