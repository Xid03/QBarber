import type { AdminAnalyticsData, AdminAnalyticsRange } from '../../features/admin/types';
import { Card } from '../ui/Card';

const analyticsRangeOptions: Array<{ value: AdminAnalyticsRange; label: string }> = [
  { value: 'last14days', label: 'Last 14 days' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This week' }
];

export function DateRangePicker({
  value,
  onChange
}: {
  value: AdminAnalyticsRange;
  onChange: (nextRange: AdminAnalyticsRange) => void;
}) {
  return (
    <Card className="admin-panel flex flex-wrap items-center gap-3">
      <p className="section-label">Date range</p>
      <div className="admin-soft-surface inline-flex rounded-full bg-slate-100 p-1 text-sm">
        {analyticsRangeOptions.map((option) => {
          const isActive = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`rounded-full px-3 py-1 font-medium transition ${
                isActive
                  ? 'admin-chip-active bg-white shadow-sm'
                  : 'text-muted hover:bg-white/70 hover:text-slate-900'
              }`}
              aria-pressed={isActive}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </Card>
  );
}

export function TrafficChart({ data }: { data: AdminAnalyticsData['hourlyTraffic'] }) {
  const max = Math.max(...data.map((item) => item.count), 1);

  return (
    <Card className="admin-panel space-y-4">
      <div>
        <p className="section-label">Traffic chart</p>
        <p className="mt-2 text-lg font-semibold text-slate-900">When customers usually show up.</p>
      </div>
      <div className="grid gap-3">
        {data.map((item) => (
          <div key={item.hour} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-900">{item.hour}:00</span>
              <span className="text-muted">{item.count} visits</span>
            </div>
            <div className="h-3 rounded-full bg-slate-200">
              <div
                className="h-3 rounded-full bg-brand-600"
                style={{ width: `${(item.count / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function WaitTimeDistribution({ averageWaitMin }: { averageWaitMin: number }) {
  const tiers = [
    { label: '< 10 min', value: Math.max(averageWaitMin < 10 ? 3 : 1, 1) },
    { label: '10-20 min', value: averageWaitMin >= 10 && averageWaitMin <= 20 ? 4 : 2 },
    { label: '20+ min', value: averageWaitMin > 20 ? 4 : 1 }
  ];
  const max = Math.max(...tiers.map((tier) => tier.value), 1);

  return (
    <Card className="admin-panel space-y-4">
      <div>
        <p className="section-label">Wait distribution</p>
        <p className="mt-2 text-lg font-semibold text-slate-900">Current wait profile by bucket.</p>
      </div>
      <div className="grid gap-3">
        {tiers.map((tier) => (
          <div key={tier.label} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-900">{tier.label}</span>
              <span className="text-muted">{tier.value}</span>
            </div>
            <div className="h-3 rounded-full bg-slate-200">
              <div className="h-3 rounded-full bg-warning-500" style={{ width: `${(tier.value / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function PeakHoursHeatmap({ data }: { data: AdminAnalyticsData['hourlyTraffic'] }) {
  const max = Math.max(...data.map((item) => item.count), 1);

  return (
    <Card className="admin-panel space-y-4">
      <div>
        <p className="section-label">Peak hours</p>
        <p className="mt-2 text-lg font-semibold text-slate-900">Quick heat scan of busy windows.</p>
      </div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {data.map((item) => {
          const opacity = 0.18 + item.count / max;

          return (
            <div
              key={item.hour}
              className="rounded-2xl px-4 py-4 text-sm font-medium text-slate-900"
              style={{ backgroundColor: `rgba(37, 99, 235, ${Math.min(opacity, 0.88)})` }}
            >
              <div>{item.hour}:00</div>
              <div className="mt-2 text-xs">{item.count} visits</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export function ServicePopularity({ data }: { data: AdminAnalyticsData['servicePopularity'] }) {
  const total = data.reduce((sum, item) => sum + item.count, 0) || 1;

  return (
    <Card className="admin-panel space-y-4">
      <div>
        <p className="section-label">Service popularity</p>
        <p className="mt-2 text-lg font-semibold text-slate-900">Which services are carrying the floor.</p>
      </div>
      <div className="grid gap-3">
        {data.map((item) => (
          <div key={item.service} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-900">{item.service}</span>
              <span className="text-muted">{Math.round((item.count / total) * 100)}%</span>
            </div>
            <div className="h-3 rounded-full bg-slate-200">
              <div
                className="h-3 rounded-full bg-success-600"
                style={{ width: `${(item.count / total) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
