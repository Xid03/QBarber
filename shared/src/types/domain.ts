import type { BusyLevel, QueueStatus, ShopStatus } from '../constants/enums';

export interface Shop {
  id: string;
  name: string;
  slug: string;
  status: ShopStatus;
}

export interface ServiceType {
  id: string;
  shopId: string;
  name: string;
  durationMinutes: number;
  priceCents: number;
}

export interface QueueEntry {
  id: string;
  shopId: string;
  customerName: string;
  customerPhone?: string | null;
  serviceTypeId: string;
  status: QueueStatus;
  position: number;
  estimatedWaitMinutes: number;
  busyLevel: BusyLevel;
}
