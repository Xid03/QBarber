import { AlertTriangle, Clock3, Sparkles, TimerReset, UsersRound } from 'lucide-react';

import { formatMinutes, getBusyTone, getQueueWarning } from '../../features/public/formatters';
import type { QueueStatusData, ShopMetadata } from '../../features/public/types';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';

export function WaitTimeCard({
  waitMinutes,
  queueLength,
  isOpen
}: {
  waitMinutes: number;
  queueLength: number;
  isOpen: boolean;
}) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-brand-100 blur-2xl" />
      <div className="relative space-y-4">
        <p className="section-label">Estimated wait</p>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-4xl font-bold tracking-tight sm:text-5xl">{formatMinutes(waitMinutes)}</p>
            <p className="mt-2 text-sm text-muted">
              {isOpen ? getQueueWarning(queueLength) : 'The queue is paused until the shop reopens.'}
            </p>
          </div>
          <div className="rounded-2xl bg-brand-600 p-3 text-white">
            <Clock3 size={22} />
          </div>
        </div>
      </div>
    </Card>
  );
}

export function QueuePositionIndicator({
  queueLength,
  queueLabel
}: {
  queueLength: number;
  queueLabel: string;
}) {
  return (
    <Card className="space-y-4">
      <p className="section-label">Queue snapshot</p>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-4xl font-bold tracking-tight sm:text-5xl">{queueLength}</p>
          <p className="mt-2 text-sm text-muted">{queueLabel}</p>
        </div>
        <div className="rounded-2xl bg-slate-900 p-3 text-white">
          <UsersRound size={22} />
        </div>
      </div>
    </Card>
  );
}

export function BusyLevelBar({
  busyLevel,
  queueLength
}: {
  busyLevel: QueueStatusData['busyLevel'];
  queueLength: number;
}) {
  const widths = {
    LOW: 'w-1/3',
    MEDIUM: 'w-2/3',
    HIGH: 'w-full'
  };

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="section-label">Busy level</p>
          <p className="mt-2 text-sm text-muted">
            {queueLength === 0
              ? 'It is a calm moment right now.'
              : `Queue pressure is currently marked ${busyLevel.toLowerCase()}.`}
          </p>
        </div>
        <StatusBadge label={busyLevel} tone={getBusyTone(busyLevel)} />
      </div>
      <div className="h-3 rounded-full bg-slate-200">
        <div
          className={`h-3 rounded-full ${
            busyLevel === 'HIGH'
              ? 'bg-danger-600'
              : busyLevel === 'MEDIUM'
                ? 'bg-warning-500'
                : 'bg-success-600'
          } ${widths[busyLevel]}`}
        />
      </div>
    </Card>
  );
}

export function NowServingCard({
  nowServing,
  shop
}: {
  nowServing: QueueStatusData['nowServing'];
  shop?: ShopMetadata;
}) {
  if (!shop?.isOpen) {
    return (
      <Card className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-danger-100 p-3 text-danger-600">
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="section-label">Shop closed</p>
            <p className="text-lg font-semibold">Queue joins are paused for now.</p>
          </div>
        </div>
        <p className="text-sm text-muted">
          Browse the opening hours below or check the historical trends to plan a better visit window.
        </p>
      </Card>
    );
  }

  if (!nowServing) {
    return (
      <Card className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-success-100 p-3 text-success-600">
            <Sparkles size={20} />
          </div>
          <div>
            <p className="section-label">No active service</p>
            <p className="text-lg font-semibold">No one is in the chair right now.</p>
          </div>
        </div>
        <p className="text-sm text-muted">That usually means the queue can move quickly once you join.</p>
      </Card>
    );
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="section-label">Now serving</p>
          <p className="mt-2 text-2xl font-semibold">{nowServing.customerName}</p>
        </div>
        <StatusBadge label="In progress" tone="info" />
      </div>
      <div className="grid gap-3 text-sm text-muted sm:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="font-medium text-slate-900">Service</p>
          <p className="mt-1">{nowServing.service}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="font-medium text-slate-900">Barber</p>
          <p className="mt-1">{nowServing.barberName ?? 'Assigning chair'}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="font-medium text-slate-900">Queue pace</p>
          <p className="mt-1">Live refresh keeps this card current.</p>
        </div>
      </div>
    </Card>
  );
}

export function HistoricalInsightCard({
  averageWaitMinutes,
  bestTimeLabel
}: {
  averageWaitMinutes: number;
  bestTimeLabel: string;
}) {
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="section-label">Best time to visit</p>
          <p className="mt-2 text-xl font-semibold">{bestTimeLabel}</p>
        </div>
        <div className="rounded-2xl bg-warning-100 p-3 text-warning-500">
          <TimerReset size={20} />
        </div>
      </div>
      <p className="text-sm text-muted">
        Recent traffic suggests an average wait of {formatMinutes(averageWaitMinutes).replace('~', '')}.
      </p>
    </Card>
  );
}
