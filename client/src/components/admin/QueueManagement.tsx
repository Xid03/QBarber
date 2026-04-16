import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export function ActionButtons() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button>Start</Button>
      <Button variant="secondary">Complete</Button>
    </div>
  );
}

export function QueueRow() {
  return (
    <div className="grid gap-3 rounded-md border border-slate-200 px-4 py-3 lg:grid-cols-[1fr,1fr,1fr,auto]">
      <span>Placeholder customer</span>
      <span>Haircut</span>
      <span>Waiting</span>
      <ActionButtons />
    </div>
  );
}

export function AdminQueueTable() {
  return (
    <Card>
      <p className="mb-4 text-sm text-slate-500">AdminQueueTable</p>
      <div className="grid gap-3">
        <QueueRow />
        <QueueRow />
      </div>
    </Card>
  );
}

export function AddCustomerForm() {
  return (
    <Card>
      <p className="text-sm text-slate-500">AddCustomerForm placeholder.</p>
    </Card>
  );
}

export function CustomerDetailModal() {
  return (
    <Card>
      <p className="text-sm text-slate-500">CustomerDetailModal placeholder.</p>
    </Card>
  );
}
