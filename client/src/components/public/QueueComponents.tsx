import type { ReactNode } from 'react';
import { CircleOff, LoaderCircle, LogOut, TimerReset, UserRound } from 'lucide-react';

import { formatJoinedAt, formatMinutes } from '../../features/public/formatters';
import type { QueueEntryView } from '../../features/public/types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';

export function QueueItem({
  entry,
  compact = false,
  highlight = false
}: {
  entry: QueueEntryView;
  compact?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border px-4 py-4 transition ${
        highlight ? 'border-brand-200 bg-brand-50/80' : 'border-slate-200/80 bg-white/70'
      } ${compact ? 'text-sm' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Position {entry.position}
          </p>
          <p className="mt-2 text-base font-semibold text-slate-900">{entry.customerName}</p>
          <p className="mt-1 text-sm text-muted">{entry.serviceName}</p>
        </div>
        <StatusBadge
          label={entry.status.replace('_', ' ')}
          tone={
            entry.status === 'IN_PROGRESS'
              ? 'info'
              : entry.status === 'WAITING'
                ? 'warning'
                : entry.status === 'COMPLETED'
                  ? 'success'
                  : 'danger'
          }
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-3 text-xs font-medium text-muted">
        <span>Joined {formatJoinedAt(entry.joinedAt)}</span>
        <span>Wait {formatMinutes(entry.estimatedWaitMinutes)}</span>
        <span>{entry.barberName ? `Barber ${entry.barberName}` : 'First available barber'}</span>
      </div>
    </div>
  );
}

export function QueueList({
  entries,
  title = 'People waiting right now'
}: {
  entries: QueueEntryView[];
  title?: string;
}) {
  if (entries.length === 0) {
    return (
      <Card className="space-y-3">
        <p className="section-label">{title}</p>
        <div className="rounded-3xl border border-dashed border-brand-200 bg-brand-50/60 px-5 py-8 text-center">
          <p className="text-lg font-semibold">No one is waiting right now.</p>
          <p className="mt-2 text-sm text-muted">Perfect timing if you want the quickest possible walk-in.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="section-label">{title}</p>
        <p className="text-sm text-muted">{entries.length} active entries</p>
      </div>
      <div className="grid gap-3">
        {entries.map((entry) => (
          <QueueItem key={entry.entryId} entry={entry} />
        ))}
      </div>
    </Card>
  );
}

export function PositionTracker({
  entry,
  peopleAheadCount
}: {
  entry: QueueEntryView;
  peopleAheadCount: number;
}) {
  const headline =
    entry.status === 'IN_PROGRESS'
      ? 'You are in the chair'
      : peopleAheadCount === 0
        ? "You're almost up"
        : `${peopleAheadCount} ${peopleAheadCount === 1 ? 'person' : 'people'} ahead`;

  return (
    <Card className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="section-label">Your live position</p>
          <p className="mt-2 text-5xl font-bold tracking-tight text-slate-950">#{entry.position}</p>
        </div>
        <div className="rounded-3xl bg-brand-600 px-4 py-3 text-white shadow-soft">
          <p className="text-xs uppercase tracking-[0.22em] text-brand-100">Approx wait</p>
          <p className="mt-1 text-xl font-semibold">{formatMinutes(entry.estimatedWaitMinutes)}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <TrackerMetric icon={<UserRound size={16} />} label="Status" value={entry.status.replace('_', ' ')} />
        <TrackerMetric icon={<LoaderCircle size={16} />} label="Service" value={entry.serviceName} />
        <TrackerMetric icon={<TimerReset size={16} />} label="Queue note" value={headline} />
      </div>
    </Card>
  );
}

export function PeopleAheadList({ entries }: { entries: QueueEntryView[] }) {
  if (entries.length === 0) {
    return (
      <Card className="space-y-3">
        <p className="section-label">People ahead</p>
        <div className="rounded-2xl bg-success-100 px-4 py-5 text-sm text-success-600">
          You are next in line once the current service wraps up.
        </div>
      </Card>
    );
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="section-label">People ahead</p>
        <p className="text-sm text-muted">{entries.length} ahead of you</p>
      </div>
      <div className="grid gap-3">
        {entries.map((entry) => (
          <QueueItem key={entry.entryId} entry={entry} compact highlight={entry.position === 1} />
        ))}
      </div>
    </Card>
  );
}

export function LeaveQueueButton({
  onLeave,
  isLoading
}: {
  onLeave: () => void;
  isLoading?: boolean;
}) {
  return (
    <Button variant="secondary" className="w-full sm:w-auto" onClick={onLeave} disabled={isLoading}>
      <LogOut size={16} className="mr-2 inline-flex" />
      {isLoading ? 'Leaving queue...' : 'Leave queue'}
    </Button>
  );
}

export function QueueLoadingCard({ label }: { label: string }) {
  return (
    <Card className="space-y-3">
      <p className="section-label">{label}</p>
      <div className="grid gap-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="animate-pulse rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-4">
            <div className="h-3 w-24 rounded-full bg-slate-200" />
            <div className="mt-3 h-5 w-40 rounded-full bg-slate-200" />
            <div className="mt-3 h-3 w-full rounded-full bg-slate-100" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export function ErrorStateCard({
  title,
  message,
  onRetry
}: {
  title: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <Card className="space-y-4 border border-danger-100">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-danger-100 p-3 text-danger-600">
          <CircleOff size={20} />
        </div>
        <div>
          <p className="section-label">Connection issue</p>
          <p className="text-lg font-semibold">{title}</p>
        </div>
      </div>
      <p className="text-sm text-muted">{message}</p>
      {onRetry ? (
        <Button variant="secondary" onClick={onRetry} className="w-full sm:w-auto">
          Try again
        </Button>
      ) : null}
    </Card>
  );
}

function TrackerMetric({
  icon,
  label,
  value
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {icon}
        {label}
      </div>
      <p className="mt-3 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}
