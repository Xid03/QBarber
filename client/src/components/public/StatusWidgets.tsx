import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';

export function WaitTimeCard() {
  return (
    <Card>
      <p className="text-sm text-slate-500">WaitTimeCard</p>
      <p className="mt-3 text-4xl font-bold">~18 min</p>
    </Card>
  );
}

export function QueuePositionIndicator() {
  return (
    <Card>
      <p className="text-sm text-slate-500">QueuePositionIndicator</p>
      <p className="mt-3 text-3xl font-bold">Now Serving #24</p>
    </Card>
  );
}

export function BusyLevelBar() {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">BusyLevelBar</p>
        <StatusBadge label="Moderate" tone="warning" />
      </div>
      <div className="mt-4 h-3 rounded-full bg-slate-200">
        <div className="h-3 w-2/3 rounded-full bg-warning-500" />
      </div>
    </Card>
  );
}

export function NowServingCard() {
  return (
    <Card>
      <p className="text-sm text-slate-500">NowServingCard</p>
      <p className="mt-3 text-xl font-semibold">Placeholder highlight for current customer.</p>
    </Card>
  );
}
