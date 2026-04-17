import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Eye, Play, X } from 'lucide-react';
import type { ReactNode } from 'react';
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
  onView,
  onStart,
  onComplete,
  onCancel,
  disabled
}: {
  status: QueueStatusData['queue'][number]['status'];
  onView: () => void;
  onStart: () => void;
  onComplete: () => void;
  onCancel: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <IconActionButton
        label="View details"
        tone="secondary"
        icon={<Eye size={15} />}
        onClick={onView}
        disabled={disabled}
      />
      {status === 'WAITING' ? (
        <IconActionButton label="Start service" tone="primary" icon={<Play size={15} />} onClick={onStart} disabled={disabled} />
      ) : null}
      {status === 'IN_PROGRESS' ? (
        <IconActionButton
          label="Complete service"
          tone="success"
          icon={<Check size={15} />}
          onClick={onComplete}
          disabled={disabled}
        />
      ) : null}
      {status !== 'COMPLETED' && status !== 'CANCELLED' ? (
        <IconActionButton label="Cancel queue item" tone="danger" icon={<X size={15} />} onClick={onCancel} disabled={disabled} />
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
      className={`admin-queue-row grid gap-4 rounded-2xl border-l-4 border bg-white px-5 py-5 text-left shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md lg:grid-cols-[1.45fr,0.95fr,0.95fr,0.85fr,auto] ${
        entry.status === 'IN_PROGRESS'
          ? 'admin-queue-row-active border-l-primary-500 border-y-primary-200 border-r-primary-200 bg-primary-50/70 ring-1 ring-primary-100'
          : 'border-l-transparent border-slate-200'
      }`}
    >
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-xl bg-slate-100 px-3 text-sm font-semibold text-slate-700">
            #{entry.position}
          </span>
          {entry.status === 'IN_PROGRESS' ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-700">
              <span className="live-dot h-2 w-2 rounded-full bg-primary-500" />
              Serving
            </span>
          ) : null}
        </div>
        <p className="mt-3 text-base font-semibold text-slate-900">{entry.customerName}</p>
        <p className="mt-1 text-sm text-slate-500">{entry.customerPhone ?? 'Phone not provided'}</p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Service</p>
        <p className="mt-3 text-sm font-semibold text-slate-900">{entry.serviceName}</p>
        <p className="mt-1 text-xs text-slate-500">
          {entry.status === 'IN_PROGRESS'
            ? `Started ${formatJoinedAt(entry.startedAt ?? entry.joinedAt)}`
            : `Queue joined ${formatJoinedAt(entry.joinedAt)}`}
        </p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Wait</p>
        <div className="mt-3">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
              entry.estimatedWaitMinutes > 30
                ? 'bg-danger-50 text-danger-600'
                : entry.estimatedWaitMinutes >= 15
                  ? 'bg-warning-50 text-warning-600'
                  : 'bg-success-50 text-success-600'
            }`}
          >
            {entry.status === 'IN_PROGRESS' ? 'In service' : formatMinutes(entry.estimatedWaitMinutes)}
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {entry.barberName ? `Assigned to ${entry.barberName}` : 'Waiting for first available barber'}
        </p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Status</p>
        <div className="mt-2">
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
      </div>
      <div className="flex items-start lg:justify-end">
        <ActionButtons
          status={entry.status}
          onView={onSelect}
          onStart={onStart}
          onComplete={onComplete}
          onCancel={onCancel}
          disabled={disabled}
        />
      </div>
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
    <Card className="admin-panel space-y-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="section-label">Queue management</p>
          <p className="mt-2 text-xl font-semibold text-slate-800">Live queue with hands-on service controls.</p>
        </div>
        <p className="text-sm font-medium text-slate-500">{entries.length} active queue entries</p>
      </div>
      {entries.length === 0 ? (
        <div className="admin-soft-surface rounded-2xl border border-dashed border-success-100 bg-success-50 px-5 py-10 text-center">
          <p className="text-lg font-semibold text-slate-900">No one is waiting! 🎉</p>
          <p className="mt-2 text-sm text-slate-600">This is a calm window for the shop. Add the first customer manually if someone walks in now.</p>
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
  onSubmit: (values: ManualAddValues) => Promise<void> | void;
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
    <Card className="admin-panel space-y-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div>
        <p className="section-label">Add walk-in</p>
        <p className="mt-2 text-xl font-semibold text-slate-800">Bring a customer into the queue from the counter.</p>
      </div>
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          void form.handleSubmit(async (values) => {
            await onSubmit(values);
            form.reset({
              customerName: '',
              customerPhone: '',
              serviceTypeId: shop.serviceTypes[0]?.id ?? ''
            });
          })(event);
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
      <Card className="admin-panel space-y-3 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <p className="section-label">Customer detail</p>
        <p className="text-sm text-slate-600">Select a queue row to inspect more detail here.</p>
      </Card>
    );
  }

  return (
    <Card className="admin-panel space-y-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div>
        <p className="section-label">Customer detail</p>
        <p className="mt-2 text-xl font-semibold text-slate-900">{entry.customerName}</p>
      </div>
      <div className="grid gap-3 text-sm text-slate-600">
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

function IconActionButton({
  label,
  icon,
  tone,
  onClick,
  disabled
}: {
  label: string;
  icon: ReactNode;
  tone: 'primary' | 'secondary' | 'success' | 'danger';
  onClick: () => void;
  disabled?: boolean;
}) {
  const tones = {
    primary: 'bg-primary-600 text-white shadow-sm hover:bg-primary-700 hover:shadow-md',
    secondary: 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50',
    success: 'bg-success-500 text-white shadow-sm hover:bg-success-600 hover:shadow-md',
    danger: 'bg-danger-500 text-white shadow-sm hover:bg-danger-600 hover:shadow-md'
  };

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      disabled={disabled}
      className={`flex h-9 w-9 items-center justify-center rounded-xl transition duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${tones[tone]}`}
    >
      {icon}
    </button>
  );
}
