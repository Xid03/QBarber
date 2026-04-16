import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export function StatCard({ title }: { title: string }) {
  return (
    <Card>
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-3 text-3xl font-bold">--</p>
    </Card>
  );
}

export function QuickActionPanel() {
  return (
    <Card>
      <p className="mb-4 text-sm text-slate-500">QuickActionPanel</p>
      <div className="flex flex-wrap gap-3">
        <Button>Add Walk-in</Button>
        <Button variant="secondary">Toggle Shop Status</Button>
      </div>
    </Card>
  );
}

export function MiniChart() {
  return (
    <Card>
      <p className="text-sm text-slate-500">MiniChart placeholder for today&apos;s traffic sparkline.</p>
    </Card>
  );
}
