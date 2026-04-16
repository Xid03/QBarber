import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export function ServiceTypeSelector() {
  return (
    <Card>
      <p className="text-sm text-slate-500">ServiceTypeSelector</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button className="rounded-md border border-brand-600 bg-brand-100 px-4 py-4 text-left text-sm font-semibold text-brand-700">
          Haircut - 30 min
        </button>
        <button className="rounded-md border border-slate-200 bg-white px-4 py-4 text-left text-sm font-semibold">
          Beard Trim - 15 min
        </button>
      </div>
    </Card>
  );
}

export function JoinQueueForm() {
  return (
    <Card>
      <p className="text-sm text-slate-500">JoinQueueForm</p>
      <div className="mt-4 grid gap-4">
        <Input placeholder="Customer name" />
        <Input placeholder="Phone number (optional)" />
        <ServiceTypeSelector />
        <Button>Join Queue Placeholder</Button>
      </div>
    </Card>
  );
}

export function ConfirmationModal() {
  return (
    <Card>
      <p className="text-sm text-slate-500">ConfirmationModal</p>
      <p className="mt-3 text-lg font-semibold">Placeholder confirmation after queue join.</p>
    </Card>
  );
}
