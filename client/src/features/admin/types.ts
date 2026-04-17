import type { QueueEntryView } from '../public/types';

export type AdminAnalyticsRange = 'today' | 'week' | 'last14days';

export type AdminSession = {
  token: string;
  admin: {
    id: string;
    username: string;
    displayName: string;
    role: string;
  };
  shop: {
    id: string;
    name: string;
  };
};

export type AdminDashboardData = {
  stats: {
    servedCount: number;
    averageWaitMin: number;
    inQueue: number;
    revenueEstimateCents: number;
  };
  liveQueue: QueueEntryView[];
  nowServing: {
    entryId: string;
    customerName: string;
    service: string;
    barberName: string | null;
  } | null;
  busyLevel: 'LOW' | 'MEDIUM' | 'HIGH';
};

export type AdminAnalyticsData = {
  averageWaitMin: number;
  servicePopularity: Array<{
    service: string;
    count: number;
  }>;
  hourlyTraffic: Array<{
    hour: string;
    count: number;
  }>;
};

export type AdminSettingsData = {
  id: string;
  name: string;
  slug: string;
  status: 'OPEN' | 'CLOSED';
  timezone: string;
  phone: string | null;
  address: string | null;
  admins: Array<{
    id: string;
    username: string;
    displayName: string;
    role: string;
  }>;
  serviceTypes: Array<{
    id: string;
    name: string;
    durationMinutes: number;
    priceCents: number;
    isActive: boolean;
  }>;
  barbers: Array<{
    id: string;
    name: string;
    isActive: boolean;
  }>;
  operatingHours: Array<{
    id: string;
    dayOfWeek: number;
    opensAt: string;
    closesAt: string;
    isEnabled: boolean;
  }>;
};
