import type { ReactNode } from 'react';
import { Activity, ArrowRight, BarChart3, Check, Plus, Settings2 } from 'lucide-react';

import type { AdminDashboardData } from '../../features/admin/types';
import { formatCurrency, formatMinutes } from '../../features/public/formatters';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';

export function ShowcaseStatCard({
  title,
  value,
  helper,
  icon,
  accentClass
}: {
  title: string;
  value: string;
  helper: string;
  icon: ReactNode;
  accentClass: string;
}) {
  return (
    <Card className="rounded-3xl border border-white/80 bg-white px-5 py-5 shadow-[0_14px_32px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div className={`rounded-2xl p-3 ${accentClass}`}>{icon}</div>
      </div>
      <div className="mt-5">
        <p className="text-4xl font-bold tracking-tight text-slate-950">{value}</p>
        <p className="mt-2 text-sm text-emerald-600">{helper}</p>
      </div>
    </Card>
  );
}

export function ShowcaseLiveQueue({
  points,
  onViewAll,
  onManualAdd
}: {
  points: AdminDashboardData['liveQueue'];
  onViewAll: () => void;
  onManualAdd: () => void;
}) {
  const topEntries = points.slice(0, 4);

  return (
    <Card className="rounded-[28px] border border-white/80 bg-white shadow-[0_18px_38px_rgba(15,23,42,0.08)]">
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <p className="text-xl font-semibold text-slate-950">Live Queue</p>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              LIVE
            </span>
          </div>
          <button className="text-sm font-semibold text-[#5b31f4]" onClick={onViewAll}>
            View All
          </button>
        </div>

        {topEntries.length === 0 ? (
          <p className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            No one is queued up at the moment.
          </p>
        ) : (
          <div className="grid gap-3">
            {topEntries.map((entry) => (
              <div
                key={entry.entryId}
                className={`rounded-2xl border px-4 py-4 ${
                  entry.status === 'IN_PROGRESS'
                    ? 'border-[#a6b4ff] bg-[#eef2ff]'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <div className="flex h-11 min-w-11 items-center justify-center rounded-2xl bg-[#f2f3ff] text-sm font-semibold text-[#5b31f4]">
                      #{entry.position}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-950">{entry.customerName}</p>
                        {entry.status === 'IN_PROGRESS' ? (
                          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5b31f4]">
                            Serving
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {entry.serviceName}
                        {entry.status === 'IN_PROGRESS'
                          ? ` • Started ${new Date(entry.startedAt ?? entry.joinedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
                          : ` • Waiting ${formatMinutes(entry.estimatedWaitMinutes)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {entry.status === 'IN_PROGRESS' ? (
                      <>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white">
                          <Check size={16} />
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500 text-white">
                          <Plus size={16} className="rotate-45" />
                        </div>
                      </>
                    ) : (
                      <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-500">
                        +{entry.estimatedWaitMinutes}m
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onManualAdd}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#eef2ff] px-4 py-3 text-sm font-semibold text-[#5b31f4] transition hover:bg-[#e5eafe]"
        >
          <Plus size={16} />
          Add Customer Manually
        </button>
      </div>
    </Card>
  );
}

export function ShowcaseTrafficCard({ data }: { data: AdminDashboardData }) {
  const currentLabel = data.busyLevel === 'HIGH' ? 'Busy' : data.busyLevel === 'MEDIUM' ? 'Steady' : 'Moderate';

  return (
    <Card className="rounded-3xl border border-white/80 bg-white shadow-[0_14px_32px_rgba(15,23,42,0.08)]">
      <div className="space-y-4">
        <p className="text-lg font-semibold text-slate-950">Today's Traffic</p>
        <div className="grid min-h-[180px] place-items-end rounded-2xl bg-gradient-to-b from-white to-slate-50 px-5 pb-8 pt-10">
          <div className="flex w-full items-end justify-between text-xs font-medium text-slate-400">
            {['9', '10', '11', '12', '1', '2', '3'].map((hour) => (
              <span key={hour}>{hour}</span>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <p>Peak: 11AM - 1PM</p>
          <p>Current: {currentLabel}</p>
        </div>
      </div>
    </Card>
  );
}

export function ShowcaseQuickActions({
  isShopOpen,
  onManualAdd,
  onOpenQueue,
  onOpenAnalytics,
  onOpenSettings,
  onToggleStatus,
  isUpdatingStatus
}: {
  isShopOpen: boolean;
  onManualAdd: () => void;
  onOpenQueue: () => void;
  onOpenAnalytics: () => void;
  onOpenSettings: () => void;
  onToggleStatus: () => void;
  isUpdatingStatus?: boolean;
}) {
  return (
    <Card className="rounded-3xl border border-white/80 bg-white shadow-[0_14px_32px_rgba(15,23,42,0.08)]">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-slate-950">Quick Actions</p>
            <p className="mt-1 text-sm text-slate-500">Handle the next move without leaving the overview.</p>
          </div>
          <StatusBadge label={isShopOpen ? 'Open' : 'Closed'} tone={isShopOpen ? 'success' : 'danger'} />
        </div>

        <div className="grid gap-3">
          <ActionRow icon={<Plus size={16} />} label="Add Customer" onClick={onManualAdd} primary />
          <ActionRow icon={<ArrowRight size={16} />} label="Full Queue View" onClick={onOpenQueue} />
          <ActionRow icon={<BarChart3 size={16} />} label="Analytics" onClick={onOpenAnalytics} />
          <ActionRow icon={<Settings2 size={16} />} label="Settings" onClick={onOpenSettings} />
        </div>

        <Button variant="ghost" className="w-full justify-center" onClick={onToggleStatus} disabled={isUpdatingStatus}>
          {isUpdatingStatus ? 'Updating...' : isShopOpen ? 'Mark shop closed' : 'Mark shop open'}
        </Button>
      </div>
    </Card>
  );
}

export function ShowcaseRecentActivity({ data }: { data: AdminDashboardData }) {
  const items = buildRecentActivity(data);

  return (
    <Card className="rounded-3xl border border-white/80 bg-white shadow-[0_14px_32px_rgba(15,23,42,0.08)]">
      <div className="space-y-4">
        <p className="text-lg font-semibold text-slate-950">Recent Activity</p>
        <div className="grid gap-4">
          {items.map((item) => (
            <div key={item.title} className="flex gap-3">
              <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full ${item.iconClass}`}>
                {item.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs text-slate-500">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function buildRecentActivity(data: AdminDashboardData) {
  const items: Array<{
    title: string;
    detail: string;
    icon: ReactNode;
    iconClass: string;
  }> = [];

  if (data.nowServing) {
    items.push({
      title: `Started ${data.nowServing.customerName}`,
      detail: `${data.nowServing.service} with ${data.nowServing.barberName ?? 'assigned barber'}`,
      icon: <Check size={14} />,
      iconClass: 'bg-emerald-100 text-emerald-600'
    });
  }

  data.liveQueue
    .filter((entry) => entry.status === 'WAITING')
    .slice(0, 2)
    .forEach((entry) => {
      items.push({
        title: `Added #${entry.position} ${entry.customerName}`,
        detail: `${entry.serviceName} • waiting ${formatMinutes(entry.estimatedWaitMinutes)}`,
        icon: <Plus size={14} />,
        iconClass: 'bg-violet-100 text-violet-600'
      });
    });

  if (items.length === 0) {
    items.push({
      title: 'Queue is clear',
      detail: 'No recent movement yet. New activity will appear here.',
      icon: <Activity size={14} />,
      iconClass: 'bg-slate-100 text-slate-500'
    });
  }

  return items;
}

function ActionRow({
  icon,
  label,
  onClick,
  primary = false
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
        primary
          ? 'bg-[#5b31f4] text-white shadow-[0_14px_24px_rgba(91,49,244,0.32)] hover:bg-[#4f28dd]'
          : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

export function getShowcaseStatValue(title: string, dashboard: AdminDashboardData) {
  switch (title) {
    case 'Served Today':
      return {
        value: dashboard.stats.servedCount.toString(),
        helper: '+12% vs yesterday'
      };
    case 'Avg Wait Time':
      return {
        value: formatMinutes(dashboard.stats.averageWaitMin),
        helper: dashboard.stats.averageWaitMin > 0 ? '3 min improvement' : 'Fresh queue today'
      };
    case 'In Queue':
      return {
        value: dashboard.stats.inQueue.toString(),
        helper: dashboard.nowServing ? 'Currently waiting' : 'No active queue'
      };
    default:
      return {
        value: formatCurrency(dashboard.stats.revenueEstimateCents),
        helper: '+8% vs yesterday'
      };
  }
}
