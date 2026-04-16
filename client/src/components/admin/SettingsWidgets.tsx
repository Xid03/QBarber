import { formatCurrency, formatOperatingHour } from '../../features/public/formatters';
import type { AdminSettingsData } from '../../features/admin/types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';

export function OperatingHoursEditor({ settings }: { settings: AdminSettingsData }) {
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="section-label">Operating hours</p>
          <p className="mt-2 text-lg font-semibold">Current storefront schedule.</p>
        </div>
        <StatusBadge label={settings.status === 'OPEN' ? 'Open' : 'Closed'} tone={settings.status === 'OPEN' ? 'success' : 'danger'} />
      </div>
      <div className="grid gap-2 text-sm text-muted">
        {settings.operatingHours.map((item) => (
          <div key={item.id}>{formatOperatingHour(item.dayOfWeek, item.opensAt, item.closesAt, item.isEnabled)}</div>
        ))}
      </div>
    </Card>
  );
}

export function ServiceTypeManager({ settings }: { settings: AdminSettingsData }) {
  return (
    <Card className="space-y-4">
      <div>
        <p className="section-label">Service menu</p>
        <p className="mt-2 text-lg font-semibold">Available queue services right now.</p>
      </div>
      <div className="grid gap-3">
        {settings.serviceTypes.map((serviceType) => (
          <div key={serviceType.id} className="rounded-2xl border border-slate-200/80 bg-white/60 px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-slate-900">{serviceType.name}</p>
              <StatusBadge label={serviceType.isActive ? 'Active' : 'Paused'} tone={serviceType.isActive ? 'success' : 'warning'} />
            </div>
            <p className="mt-2 text-sm text-muted">
              {serviceType.durationMinutes} min · {formatCurrency(serviceType.priceCents)}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function BarberManager({
  settings,
  onToggleStatus,
  isUpdating
}: {
  settings: AdminSettingsData;
  onToggleStatus: () => void;
  isUpdating?: boolean;
}) {
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="section-label">Shop controls</p>
          <p className="mt-2 text-lg font-semibold">Team roster and storefront switch.</p>
        </div>
        <Button variant="secondary" onClick={onToggleStatus} disabled={isUpdating}>
          {isUpdating
            ? 'Updating...'
            : settings.status === 'OPEN'
              ? 'Mark shop closed'
              : 'Mark shop open'}
        </Button>
      </div>
      <div className="grid gap-3">
        {settings.barbers.map((barber) => (
          <div key={barber.id} className="rounded-2xl border border-slate-200/80 bg-white/60 px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-slate-900">{barber.name}</p>
              <StatusBadge label={barber.isActive ? 'Active' : 'Offline'} tone={barber.isActive ? 'success' : 'warning'} />
            </div>
            <p className="mt-2 text-sm text-muted">Barber profile is available for queue assignment in later phases.</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
