import type { ReactNode } from 'react';

import { formatCurrency, formatMinutes } from '../../features/public/formatters';
import type { AdminDashboardData } from '../../features/admin/types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';

export function StatCard({
  title,
  value,
  helper,
  icon
}: {
  title: string;
  value: string;
  helper: string;
  icon: ReactNode;
}) {
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-muted">{title}</p>
        <div className="rounded-2xl bg-slate-900 p-3 text-white">{icon}</div>
      </div>
      <div>
        <p className="text-4xl font-bold tracking-tight">{value}</p>
        <p className="mt-2 text-sm text-muted">{helper}</p>
      </div>
    </Card>
  );
}

export function QuickActionPanel({
  isShopOpen,
  onManualAdd,
  onToggleStatus,
  isUpdatingStatus
}: {
  isShopOpen: boolean;
  onManualAdd: () => void;
  onToggleStatus: () => void;
  isUpdatingStatus?: boolean;
}) {
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="section-label">Quick actions</p>
          <p className="mt-2 text-lg font-semibold">Handle the next decision without leaving the overview.</p>
        </div>
        <StatusBadge label={isShopOpen ? 'Open' : 'Closed'} tone={isShopOpen ? 'success' : 'danger'} />
      </div>
      <div className="flex flex-wrap gap-3">
        <Button onClick={onManualAdd}>Add walk-in</Button>
        <Button variant="secondary" onClick={onToggleStatus} disabled={isUpdatingStatus}>
          {isUpdatingStatus ? 'Updating...' : isShopOpen ? 'Mark shop closed' : 'Mark shop open'}
        </Button>
      </div>
    </Card>
  );
}

export function MiniChart({ points }: { points: AdminDashboardData['liveQueue'] }) {
  const scale = Math.max(points.length, 1);

  return (
    <Card className="space-y-4">
      <div>
        <p className="section-label">Live queue preview</p>
        <p className="mt-2 text-lg font-semibold">Who is on deck right now.</p>
      </div>
      {points.length === 0 ? (
        <p className="text-sm text-muted">No one is queued up at the moment.</p>
      ) : (
        <div className="grid gap-3">
          {points.map((entry, index) => (
            <div key={entry.entryId} className="grid gap-2 rounded-2xl bg-slate-50 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-slate-900">
                  #{entry.position} · {entry.customerName}
                </p>
                <div className="h-2 w-24 rounded-full bg-slate-200">
                  <div
                    className="h-2 rounded-full bg-brand-600"
                    style={{ width: `${((scale - index) / scale) * 100}%` }}
                  />
                </div>
              </div>
              <p className="text-sm text-muted">
                {entry.serviceName} · {entry.status === 'IN_PROGRESS' ? 'In progress now' : formatMinutes(entry.estimatedWaitMinutes)}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export function formatStatValue(title: string, dashboard: AdminDashboardData) {
  switch (title) {
    case 'Total Served Today':
      return {
        value: dashboard.stats.servedCount.toString(),
        helper: 'Completed chairs today'
      };
    case 'Average Wait Time':
      return {
        value: formatMinutes(dashboard.stats.averageWaitMin),
        helper: 'Rolling average from completed visits'
      };
    case 'In Queue':
      return {
        value: dashboard.stats.inQueue.toString(),
        helper: dashboard.nowServing ? `Now serving ${dashboard.nowServing.customerName}` : 'No active service'
      };
    default:
      return {
        value: formatCurrency(dashboard.stats.revenueEstimateCents),
        helper: 'Revenue estimate from completed services'
      };
  }
}
