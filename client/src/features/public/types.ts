export type ShopMetadata = {
  id: string;
  name: string;
  slug: string;
  status: 'OPEN' | 'CLOSED';
  timezone: string;
  phone: string | null;
  address: string | null;
  isOpen: boolean;
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

export type QueueEntryView = {
  entryId: string;
  customerName: string;
  customerPhone: string | null;
  serviceTypeId: string;
  serviceName: string;
  position: number;
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  estimatedWaitMinutes: number;
  joinedAt: string;
  startedAt: string | null;
  completedAt: string | null;
  barberName: string | null;
};

export type QueueStatusData = {
  shop: {
    id: string;
    name: string;
    status: 'OPEN' | 'CLOSED';
    timezone: string;
    phone: string | null;
    address: string | null;
  };
  isOpen: boolean;
  currentQueue: number;
  estimatedWait: number;
  nowServing: {
    entryId: string;
    customerName: string;
    service: string;
    barberName: string | null;
  } | null;
  busyLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  queue: QueueEntryView[];
};

export type EntryStatusData = {
  entry: QueueEntryView;
  peopleAhead: QueueEntryView[];
};

export type PublicAnalyticsData = {
  averageWaitMinutes: number;
  peakHours: Array<{
    hour: string;
    count: number;
  }>;
  bestTimesToVisit: Array<{
    hour: string;
    count: number;
  }>;
};
