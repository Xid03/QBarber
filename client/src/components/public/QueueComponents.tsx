import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export function QueueItem() {
  return (
    <div className="rounded-md border border-slate-200 px-4 py-3 text-sm">
      Placeholder QueueItem for position, service, and wait time.
    </div>
  );
}

export function QueueList() {
  return (
    <Card>
      <p className="mb-4 text-sm text-slate-500">QueueList</p>
      <div className="grid gap-3">
        <QueueItem />
        <QueueItem />
        <QueueItem />
      </div>
    </Card>
  );
}

export function PositionTracker() {
  return (
    <Card>
      <p className="text-sm text-slate-500">PositionTracker</p>
      <p className="mt-3 text-5xl font-bold">#7</p>
    </Card>
  );
}

export function PeopleAheadList() {
  return (
    <Card>
      <p className="mb-4 text-sm text-slate-500">PeopleAheadList</p>
      <div className="grid gap-3">
        <QueueItem />
        <QueueItem />
      </div>
    </Card>
  );
}

export function LeaveQueueButton() {
  return <Button variant="secondary">Leave Queue Placeholder</Button>;
}
