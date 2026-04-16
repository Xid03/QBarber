import { zodResolver } from '@hookform/resolvers/zod';
import { Scissors, Sparkles, UserRound } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { formatCurrency } from '../../features/public/formatters';
import type { ShopMetadata } from '../../features/public/types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';

const joinQueueFormSchema = z.object({
  customerName: z.string().trim().min(2, 'Please enter your name.'),
  customerPhone: z.preprocess(
    (value) => {
      if (typeof value !== 'string') {
        return value;
      }

      const trimmed = value.trim();
      return trimmed === '' ? undefined : trimmed;
    },
    z.string().min(8, 'Phone number should be at least 8 digits.').optional()
  ),
  serviceTypeId: z.string().min(1, 'Pick a service to continue.')
});

type JoinQueueFormValues = z.infer<typeof joinQueueFormSchema>;
type JoinQueueFormInput = z.input<typeof joinQueueFormSchema>;

export function JoinQueueForm({
  shop,
  isSubmitting,
  errorMessage,
  onSubmit
}: {
  shop: ShopMetadata;
  isSubmitting?: boolean;
  errorMessage?: string;
  onSubmit: (values: JoinQueueFormValues) => void;
}) {
  const form = useForm<JoinQueueFormInput, undefined, JoinQueueFormValues>({
    resolver: zodResolver(joinQueueFormSchema),
    defaultValues: {
      customerName: '',
      customerPhone: '',
      serviceTypeId: shop.serviceTypes[0]?.id ?? ''
    }
  });

  return (
    <Card className="space-y-6">
      <div>
        <p className="section-label">Join the queue</p>
        <h2 className="mt-2 text-2xl font-semibold">Tell the shop what you need, then QFlow will place you.</h2>
      </div>

      <form
        className="grid gap-5"
        onSubmit={(event) => {
          void form.handleSubmit((values) => onSubmit(values))(event);
        }}
      >
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Customer name</span>
          <Input placeholder="A name the barber can call out" {...form.register('customerName')} />
          <FieldError message={form.formState.errors.customerName?.message} />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Phone number (optional)</span>
          <Input placeholder="+60 12-345 6789" {...form.register('customerPhone')} />
          <FieldError message={form.formState.errors.customerPhone?.message} />
        </label>

        <ServiceTypeSelector
          serviceTypes={shop.serviceTypes}
          selectedId={form.watch('serviceTypeId')}
          onSelect={(serviceTypeId) => form.setValue('serviceTypeId', serviceTypeId, { shouldValidate: true })}
        />
        <FieldError message={form.formState.errors.serviceTypeId?.message} />

        {errorMessage ? (
          <div className="rounded-2xl border border-danger-100 bg-danger-100/60 px-4 py-3 text-sm text-danger-600">
            {errorMessage}
          </div>
        ) : null}

        <div className="sticky bottom-4 z-10 rounded-3xl border border-white/70 bg-white/90 p-4 shadow-soft backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
          <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting || !shop.isOpen}>
            {isSubmitting ? 'Joining queue...' : shop.isOpen ? 'Join queue now' : 'Queue opens when the shop is live'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export function ConfirmationModal({
  queueNumber,
  estimatedWait
}: {
  queueNumber: number;
  estimatedWait: number;
}) {
  return (
    <Card className="space-y-4 border border-success-100">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-success-100 p-3 text-success-600">
          <Sparkles size={20} />
        </div>
        <div>
          <p className="section-label">Queue confirmed</p>
          <p className="text-lg font-semibold">You are in. Your current position is #{queueNumber}.</p>
        </div>
      </div>
      <p className="text-sm text-muted">
        Estimated wait is about {estimatedWait <= 0 ? 'a few minutes' : `~${estimatedWait} minutes`}. We will
        keep the tracker refreshed automatically.
      </p>
    </Card>
  );
}

function ServiceTypeSelector({
  serviceTypes,
  selectedId,
  onSelect
}: {
  serviceTypes: ShopMetadata['serviceTypes'];
  selectedId: string;
  onSelect: (serviceTypeId: string) => void;
}) {
  return (
    <div className="grid gap-3">
      <p className="text-sm font-medium text-slate-700">Service type</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {serviceTypes.map((serviceType) => {
          const isSelected = serviceType.id === selectedId;

          return (
            <button
              key={serviceType.id}
              type="button"
              onClick={() => onSelect(serviceType.id)}
              className={`rounded-3xl border px-4 py-4 text-left transition ${
                isSelected
                  ? 'border-brand-300 bg-brand-50 shadow-soft'
                  : 'border-slate-200/80 bg-white/70 hover:-translate-y-0.5 hover:bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="rounded-2xl bg-slate-900 p-2.5 text-white">
                  {serviceType.durationMinutes > 30 ? <Sparkles size={16} /> : <Scissors size={16} />}
                </div>
                <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {serviceType.durationMinutes} min
                </div>
              </div>
              <p className="mt-4 text-base font-semibold text-slate-950">{serviceType.name}</p>
              <p className="mt-1 text-sm text-muted">{formatCurrency(serviceType.priceCents)}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p className="inline-flex items-center gap-2 text-sm text-danger-600">
      <UserRound size={14} />
      {message}
    </p>
  );
}
