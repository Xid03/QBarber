import type { ReactNode } from 'react';
import {
  Activity,
  ArrowRight,
  BarChart3,
  ChevronRight,
  CircleDashed,
  Clock3,
  PauseCircle,
  Play,
  Plus,
  Settings2,
  Wallet
} from 'lucide-react';

import type { AdminAnalyticsData, AdminDashboardData } from '../../features/admin/types';
import { formatCurrency, formatMinutes } from '../../features/public/formatters';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';

export function ShowcaseStatCard({
  title,
  value,
  helper,
  icon,
  accentClass,
  trend,
  trendTone = 'success'
}: {
  title: string;
  value: string;
  helper: string;
  icon: ReactNode;
  accentClass: string;
  trend: string;
  trendTone?: 'success' | 'danger' | 'info';
}) {
  const trendStyles = {
    success: 'text-success-600',
    danger: 'text-danger-600',
    info: 'text-info-600'
  };

  return (
    <Card className="admin-panel card-interactive rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 ${accentClass}`}>{icon}</div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{title}</p>
        </div>
        <p className={`text-[11px] font-medium ${trendStyles[trendTone]}`}>{trend}</p>
      </div>

      <div className="mt-6">
        <p className="text-5xl font-bold tracking-tight tabular-nums text-slate-950">{value}</p>
        <p className="mt-2 text-sm text-slate-500">{helper}</p>
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
    <Card className="admin-panel rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <p className="text-xl font-semibold text-slate-800">Live Queue</p>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              <span className="live-dot h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Live
            </span>
          </div>
          <button className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 transition hover:text-primary-700" onClick={onViewAll}>
            View All
            <ChevronRight size={15} />
          </button>
        </div>

        {topEntries.length === 0 ? (
          <div className="admin-soft-surface rounded-2xl border border-dashed border-success-100 bg-success-50/80 px-6 py-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-success-600 shadow-md">
              <CircleDashed size={22} />
            </div>
            <p className="mt-4 text-lg font-semibold text-slate-900">No one is waiting right now.</p>
            <p className="mt-2 text-sm text-slate-600">The floor is clear, so this is a great moment to add the first customer manually.</p>
            <button
              onClick={onManualAdd}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 hover:shadow-md"
            >
              <Plus size={16} />
              Add first customer
            </button>
          </div>
        ) : (
          <div className="grid gap-3">
            {topEntries.map((entry) => {
              const waitTone =
                entry.estimatedWaitMinutes > 30
                  ? 'bg-danger-50 text-danger-600'
                  : entry.estimatedWaitMinutes >= 15
                    ? 'bg-warning-50 text-warning-600'
                    : 'bg-success-50 text-success-600';
              const elapsedProgress = getServingProgress(entry.startedAt);

              return (
                <div
                  key={entry.entryId}
                  className={`admin-queue-row rounded-2xl border-l-4 border bg-white px-4 py-4 shadow-sm transition duration-300 ${
                    entry.status === 'IN_PROGRESS'
                      ? 'admin-queue-row-active border-l-primary-500 border-y-primary-200 border-r-primary-200 bg-primary-50/70 shadow-md'
                      : 'border-l-transparent border-slate-200 hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 gap-3">
                      <div className="flex h-11 min-w-11 items-center justify-center rounded-xl bg-slate-100 text-sm font-semibold text-slate-700">
                        #{entry.position}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-base font-semibold text-slate-900">{entry.customerName}</p>
                          {entry.status === 'IN_PROGRESS' ? (
                            <span className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-700">
                              <span className="live-dot h-2 w-2 rounded-full bg-primary-500" />
                              Serving
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-sm text-slate-500">{entry.serviceName}</p>
                        {entry.status === 'IN_PROGRESS' ? (
                          <div className="mt-3 space-y-2">
                            <div className="admin-soft-surface h-1.5 overflow-hidden rounded-full bg-primary-100">
                              <div
                                className="h-full rounded-full bg-primary-500 transition-all duration-500"
                                style={{ width: `${elapsedProgress}%` }}
                              />
                            </div>
                            <p className="text-xs font-medium text-primary-700">
                              Started {formatTime(entry.startedAt ?? entry.joinedAt)}
                            </p>
                          </div>
                        ) : (
                          <p className="mt-2 text-xs font-medium text-slate-500">Joined {formatTime(entry.joinedAt)}</p>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0">
                      {entry.status === 'IN_PROGRESS' ? (
                        <span className="inline-flex items-center gap-2 rounded-full bg-success-50 px-3 py-1 text-xs font-semibold text-success-600">
                          <Play size={12} />
                          In progress
                        </span>
                      ) : (
                        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${waitTone}`}>
                          <Clock3 size={12} />
                          {formatMinutes(entry.estimatedWaitMinutes)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button
          onClick={onManualAdd}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-primary-100 bg-primary-50 px-4 py-3 text-sm font-semibold text-primary-700 transition hover:bg-primary-100"
        >
          <Plus size={16} />
          Add Customer Manually
        </button>
      </div>
    </Card>
  );
}

export function ShowcaseTrafficCard({
  analytics,
  busyLevel
}: {
  analytics?: AdminAnalyticsData;
  busyLevel: AdminDashboardData['busyLevel'];
}) {
  const baseHours = ['09', '10', '11', '12', '13', '14', '15'];
  const mergedData = baseHours.map((hour) => {
    const match = analytics?.hourlyTraffic.find((item) => item.hour === hour);
    return {
      hour,
      count: match?.count ?? 0
    };
  });
  const maxCount = Math.max(...mergedData.map((item) => item.count), 1);
  const totalCustomers = mergedData.reduce((sum, item) => sum + item.count, 0);
  const peakEntry = [...mergedData].sort((left, right) => right.count - left.count)[0];
  const currentHour = new Date().getHours().toString().padStart(2, '0');

  return (
    <Card className="admin-panel rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xl font-semibold text-slate-800">Today's Traffic</p>
            <p className="mt-1 text-sm text-slate-500">Hourly pace across the busiest part of the day.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            Total today: {totalCustomers}
          </span>
        </div>

        <div className="admin-soft-surface rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-5">
          <div className="grid h-56 grid-cols-[auto,1fr] gap-4">
            <div className="flex h-full flex-col justify-between text-xs font-medium text-slate-400">
              {[maxCount, Math.max(Math.round(maxCount / 2), 1), 0].map((tick) => (
                <span key={tick}>{tick}</span>
              ))}
            </div>

            <div className="relative flex h-full items-end gap-3">
              <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
                {[0, 1, 2].map((line) => (
                  <div key={line} className="border-t border-slate-200" />
                ))}
              </div>

              {mergedData.map((item) => {
                const height = `${Math.max((item.count / maxCount) * 100, item.count > 0 ? 18 : 8)}%`;
                const isPeak = item.hour === peakEntry?.hour;
                const isCurrent = item.hour === currentHour;

                return (
                  <div key={item.hour} className="relative z-10 flex flex-1 flex-col items-center gap-2">
                    <div className="group relative flex h-full w-full items-end">
                      {isCurrent ? <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-primary-300/90" /> : null}
                      <div
                        title={`${formatHourLabel(item.hour)}: ${item.count} customers`}
                        className={`relative w-full overflow-hidden rounded-t-xl transition-all duration-300 ${
                          isPeak ? 'ring-2 ring-warning-500/40' : ''
                        }`}
                        style={{ height }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-primary-600 via-primary-500 to-primary-300 opacity-95 group-hover:from-primary-700 group-hover:to-primary-400" />
                        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-primary-500/20 to-transparent" />
                      </div>
                    </div>
                    <span className={`text-xs font-medium ${isCurrent ? 'text-primary-700' : 'text-slate-500'}`}>
                      {formatHourLabel(item.hour)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="admin-soft-surface grid gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4 text-sm text-slate-600 sm:grid-cols-3">
          <p>Peak: {peakEntry ? `${formatHourLabel(peakEntry.hour)} - ${formatHourLabel(String(Number(peakEntry.hour) + 1).padStart(2, '0'))}` : 'No peak yet'}</p>
          <p>Current: {busyLevel === 'HIGH' ? 'Busy' : busyLevel === 'MEDIUM' ? 'Moderate' : 'Quiet'}</p>
          <p>Average wait: {analytics ? formatMinutes(analytics.averageWaitMin) : 'n/a'}</p>
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
    <Card className="admin-panel rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xl font-semibold text-slate-800">Quick Actions</p>
            <p className="mt-1 text-sm text-slate-500">The fastest path to the controls you use most.</p>
          </div>
          <StatusBadge label={isShopOpen ? 'Open' : 'Closed'} tone={isShopOpen ? 'success' : 'danger'} />
        </div>

        <div className="grid gap-3">
          <ActionRow icon={<Plus size={16} />} label="Add Customer" onClick={onManualAdd} primary />
          <ActionRow icon={<ArrowRight size={16} />} label="Full Queue View" onClick={onOpenQueue} />
          <ActionRow icon={<BarChart3 size={16} />} label="Analytics" onClick={onOpenAnalytics} />
          <ActionRow icon={<Settings2 size={16} />} label="Settings" onClick={onOpenSettings} />
        </div>

        <Button
          variant="ghost"
          className="w-full justify-center"
          onClick={onToggleStatus}
          disabled={isUpdatingStatus}
        >
          {isUpdatingStatus ? 'Updating shop status...' : isShopOpen ? 'Pause intake' : 'Resume intake'}
        </Button>
      </div>
    </Card>
  );
}

export function ShowcaseRecentActivity({
  data,
  analytics
}: {
  data: AdminDashboardData;
  analytics?: AdminAnalyticsData;
}) {
  const items = buildRecentActivity(data, analytics);

  return (
    <Card className="admin-panel rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="space-y-4">
        <p className="text-xl font-semibold text-slate-800">Recent Activity</p>
        <div className="grid gap-4">
          {items.map((item) => (
            <div key={item.title} className="flex gap-3">
              <div className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-full ${item.iconClass}`}>
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

function buildRecentActivity(data: AdminDashboardData, analytics?: AdminAnalyticsData) {
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
      icon: <Play size={14} />,
      iconClass: 'bg-primary-100 text-primary-600'
    });
  }

  if (data.stats.servedCount > 0) {
    items.push({
      title: `Completed ${data.stats.servedCount} service${data.stats.servedCount > 1 ? 's' : ''} today`,
      detail: `${formatCurrency(data.stats.revenueEstimateCents)} generated so far`,
      icon: <Wallet size={14} />,
      iconClass: 'bg-success-100 text-success-600'
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
        iconClass: 'bg-warning-50 text-warning-600'
      });
    });

  if (analytics?.servicePopularity[0]) {
    items.push({
      title: `${analytics.servicePopularity[0].service} is leading demand`,
      detail: `${analytics.servicePopularity[0].count} bookings or walk-ins in the current sample`,
      icon: <Activity size={14} />,
      iconClass: 'bg-info-50 text-info-600'
    });
  }

  if (items.length === 0) {
    items.push({
      title: 'Queue is quiet right now',
      detail: 'New walk-ins and completed services will show up here as the floor gets moving.',
      icon: <PauseCircle size={14} />,
      iconClass: 'bg-slate-100 text-slate-500'
    });
  }

  return items.slice(0, 4);
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
      className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
        primary
          ? 'bg-primary-600 text-white shadow-sm hover:bg-primary-700 hover:shadow-md'
          : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function formatHourLabel(hour: string) {
  const numericHour = Number(hour);
  const suffix = numericHour >= 12 ? 'PM' : 'AM';
  const displayHour = numericHour % 12 === 0 ? 12 : numericHour % 12;
  return `${displayHour} ${suffix}`;
}

function formatTime(value: string | Date) {
  return new Date(value).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit'
  });
}

function getServingProgress(startedAt: string | Date | null) {
  if (!startedAt) {
    return 18;
  }

  const elapsedMinutes = Math.max(0, (Date.now() - new Date(startedAt).getTime()) / 60000);
  return Math.min(100, 18 + elapsedMinutes * 2.2);
}

export function getShowcaseStatValue(title: string, dashboard: AdminDashboardData) {
  switch (title) {
    case 'Served Today':
      return {
        value: dashboard.stats.servedCount.toString(),
        helper: 'Completed services so far today',
        trend: '+12% vs yesterday',
        trendTone: 'success' as const
      };
    case 'Avg Wait Time':
      return {
        value: formatMinutes(dashboard.stats.averageWaitMin),
        helper: 'Rolling wait estimate across recent completions',
        trend: dashboard.stats.averageWaitMin > 0 ? '-3 min vs yesterday' : 'Starting fresh today',
        trendTone: dashboard.stats.averageWaitMin > 0 ? ('success' as const) : ('info' as const)
      };
    case 'In Queue':
      return {
        value: dashboard.stats.inQueue.toString(),
        helper: dashboard.nowServing ? 'Customers currently waiting in line' : 'No one is actively waiting',
        trend: dashboard.busyLevel === 'HIGH' ? 'High pressure' : dashboard.busyLevel === 'MEDIUM' ? 'Moderate pace' : 'Light queue',
        trendTone: dashboard.busyLevel === 'HIGH' ? ('danger' as const) : ('info' as const)
      };
    default:
      return {
        value: formatCurrency(dashboard.stats.revenueEstimateCents),
        helper: 'Estimated value from completed services today',
        trend: '+8% vs yesterday',
        trendTone: 'success' as const
      };
  }
}
