export const queueStatuses = ['WAITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const;
export const shopStatuses = ['OPEN', 'CLOSED'] as const;
export const busyLevels = ['LOW', 'MODERATE', 'HIGH'] as const;

export type QueueStatus = (typeof queueStatuses)[number];
export type ShopStatus = (typeof shopStatuses)[number];
export type BusyLevel = (typeof busyLevels)[number];
