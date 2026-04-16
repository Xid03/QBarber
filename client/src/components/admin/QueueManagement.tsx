import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import type { AdminSettingsData } from '../../features/admin/types';
import type { QueueStatusData } from '../../features/public/types';
import { formatJoinedAt, formatMinutes } from '../../features/public/formatters';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { StatusBadge } from '../ui/StatusBadge';

const manualAddSchema = z.object({
  customerName: z.string().trim().min(2, 'Customer name is required.'),
  customerPhone: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value === '' ? undefined : value)),
  serviceTypeId: z.string().min(1, 'Choose a service.')
});

type ManualAddValues = z.infer<typeof manualAddSchema>;

export function ActionButtons({
  status,
  onStart,
  onComplete,
  onCancel,
  disabled
}: {
  status: QueueStatusData['queue'][number]['status'];
  onStart: () => void;
  onComplete: () => void;
  onCancel: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {status === 'WAITING' ? (
        <Button
          onClick={(event) => {
            event.stopPropagation();
            onStart();
          }}
          disabled={disabled}
        >
          Start
        </Button>
      ) : null}
      {status === 'IN_PROGRESS' ? (
        <Button
          variant="secondary"
          onClick={(event) => {
            event.stopPropagation();
            onComplete();
          }}
          disabled={disabled}
        >
          Complete
        </Button>
      ) : null}
      {status !== 'COMPLETED' && status !== 'CANCELLED' ? (
        <Button
          variant="ghost"
          onClick={(event) => {
            event.stopPropagation();
            onCancel();
          }}
          disabled={disabled}
        >
          Cancel
        </Button>
      ) : null}
    </div>
  );
}

export function QueueRow({
  entry,
  onSelect,
  onStart,
  onComplete,
  onCancel,
  disabled
}: {
  entry: QueueStatusData['queue'][number];
  onSelect: () => void;
  onStart: () => void;
  onComplete: () => void;
  onCancel: () => void;
  disabled?: boolean;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect();
        }
      }}
      className="grid gap-4 rounded-3xl border border-slate-200/80 bg-white/70 px-4 py-4 text-left transition hover:-translate-y-0.5 hover:bg-white lg:grid-cols-[1.35fr,0.95fr,0.9fr,0.8fr,auto]"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Position {entry.position}</p>
        <p className="mt-2 text-base font-semibold text-slate-900">{entry.customerName}</p>
        <p className="mt-1 text-sm text-muted">{entry.customerPhone ?? 'No phone number provided'}</p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Service</p>
        <p className="mt-2 text-sm font-medium text-slate-900">{entry.serviceName}</p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Wait</p>
        <p className="mt-2 text-sm font-medium text-slate-900">{formatMinutes(entry.estimatedWaitMinutes)}</p>
        <p className="mt-1 text-xs text-muted">Joined {formatJoinedAt(entry.joinedAt)}</p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Status</p>
        <div className="mt-2">
          <StatusBadge
            label={entry.status.replace('_', ' ')}
            tone={entry.status === 'IN_PROGRESS' ? 'info' : entry.status === 'WAITING' ? 'warning' : 'success'}
          />
        </div>
      </div>
      <ActionButtons status={entry.status} onStart={onStart} onComplete={onComplete} onCancel={onCancel} disabled={disabled} />
    </div>
  );
}

export function AdminQueueTable({
  entries,
  onSelect,
  onStart,
  onComplete,
  onCancel,
  isMutating
}: {
  entries: QueueStatusData['queue'];
  onSelect: (entryId: string) => void;
  onStart: (entryId: string) => void;
  onComplete: (entryId: string) => void;
  onCancel: (entryId: string) => void;
  isMutating?: boolean;
}) {
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="section-label">Queue management</p>
          <p className="mt-2 text-lg font-semibold">Live queue with hands-on service controls.</p>
        </div>
        <p className="text-sm text-muted">{entries.length} active queue entries</p>
      </div>
      {entries.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-brand-200 bg-brand-50/70 px-5 py-8 text-center text-sm text-muted">
          No one is waiting right now.
        </div>
      ) : (
        <div className="grid gap-3">
          {entries.map((entry) => (
            <QueueRow
              key={entry.entryId}
              entry={entry}
              onSelect={() => onSelect(entry.entryId)}
              onStart={() => onStart(entry.entryId)}
              onComplete={() => onComplete(entry.entryId)}
              onCancel={() => onCancel(entry.entryId)}
              disabled={isMutating}
            />
          ))}
        </div>
      )}
    </Card>
  );
}

export function AddCustomerForm({
  shop,
  onSubmit,
  isSubmitting,
  errorMessage
}: {
  shop: Pick<AdminSettingsData, 'serviceTypes'>;
  onSubmit: (values: ManualAddValues) => void;
  isSubmitting?: boolean;
  errorMessage?: string;
}) {
  const form = useForm<ManualAddValues>({
    resolver: zodResolver(manualAddSchema),
    defaultValues: {
      customerName: '',
      customerPhone: '',
      serviceTypeId: shop.serviceTypes[0]?.id ?? ''
    }
  });

  return (
    <Card className="space-y-5">
      <div>
        <p className="section-label">Add walk-in</p>
        <p className="mt-2 text-lg font-semibold">Bring a customer into the queue from the counter.</p>
      </div>
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          void form.handleSubmit(onSubmit)(event);
        }}
      >
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Customer name</span>
          <Input placeholder="Walk-in customer name" {...form.register('customerName')} />
          <FieldError message={form.formState.errors.customerName?.message} />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Phone number</span>
          <Input placeholder="+60 12-345 6789" {...form.register('customerPhone')} />
          <FieldError message={form.formState.errors.customerPhone?.message} />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Service</span>
          <select
            className="w-full rounded-md border border-slate-200/80 bg-white/90 px-4 py-3 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
            {...form.register('serviceTypeId')}
          >
            {shop.serviceTypes.map((serviceType) => (
              <option key={serviceType.id} value={serviceType.id}>
                {serviceType.name}
              </option>
            ))}
          </select>
        </label>
        {errorMessage ? (
          <div className="rounded-2xl border border-danger-100 bg-danger-100/60 px-4 py-3 text-sm text-danger-600">
            {errorMessage}
          </div>
        ) : null}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Adding customer...' : 'Add to queue'}
        </Button>
      </form>
    </Card>
  );
}

export function CustomerDetailModal({ entry }: { entry?: QueueStatusData['queue'][number] }) {
  if (!entry) {
    return (
      <Card className="space-y-3">
        <p className="section-label">Customer detail</p>
        <p className="text-sm text-muted">Select a queue row to inspect more detail here.</p>
      </Card>
    );
  }

  return (
    <Card className="space-y-4">
      <div>
        <p className="section-label">Customer detail</p>
        <p className="mt-2 text-lg font-semibold">{entry.customerName}</p>
      </div>
      <div className="grid gap-3 text-sm text-muted">
        <div>Phone: {entry.customerPhone ?? 'Not provided'}</div>
        <div>Service: {entry.serviceName}</div>
        <div>Status: {entry.status.replace('_', ' ')}</div>
        <div>Estimated wait: {formatMinutes(entry.estimatedWaitMinutes)}</div>
        <div>Barber: {entry.barberName ?? 'Not assigned yet'}</div>
      </div>
    </Card>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-danger-600">{message}</p>;
}
