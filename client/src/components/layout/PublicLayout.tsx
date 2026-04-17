import type { PropsWithChildren, ReactNode } from 'react';
import { BellRing, Clock3, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Logo } from '../Logo';
import type { ShopMetadata } from '../../features/public/types';
import type { LiveConnectionState } from '../../features/realtime/socket-provider';
import { formatUpdatedAt } from '../../features/public/formatters';
import { Card } from '../ui/Card';
import { ConnectionStatusBadge } from '../ui/ConnectionStatusBadge';
import { StatusBadge } from '../ui/StatusBadge';

type PublicLayoutProps = PropsWithChildren<{
  shop?: ShopMetadata;
  lastUpdated?: Date;
  actions?: ReactNode;
  connectionState?: LiveConnectionState;
}>;

export function PublicLayout({ children, shop, lastUpdated, actions, connectionState }: PublicLayoutProps) {
  return (
    <div className="page-shell mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-5 px-4 py-4 sm:px-6 sm:py-6">
      <header className="glass-panel overflow-hidden rounded-lg shadow-soft">
        <div className="flex flex-col gap-5 px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="shadow-soft">
                  <Logo size={48} />
                </div>
                <div>
                  <p className="section-label">QFlow Live Queue</p>
                  <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                    {shop?.name ?? 'Loading barbershop status...'}
                  </h1>
                </div>
              </div>
              <p className="max-w-2xl text-sm text-muted sm:text-base">
                Check the live queue, pick the right service, and decide whether this is your best time
                to swing by.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {connectionState ? <ConnectionStatusBadge state={connectionState} /> : null}
              <StatusBadge
                label={shop?.isOpen ? 'Open now' : 'Currently closed'}
                tone={shop?.isOpen ? 'success' : 'danger'}
              />
              {actions}
            </div>
          </div>

          <div className="grid gap-3 text-sm text-muted sm:grid-cols-3">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-brand-600" />
              <span>{shop?.address ?? 'Location loading'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-brand-600" />
              <span>{shop?.phone ?? 'Phone loading'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock3 size={16} className="text-brand-600" />
              <span>
                {lastUpdated ? `Updated at ${formatUpdatedAt(lastUpdated)}` : 'Fetching latest queue data'}
              </span>
            </div>
          </div>

          <nav className="flex flex-wrap gap-2">
            <TopNavLink to="/queue" label="Queue status" />
            <TopNavLink to="/queue/join" label="Join queue" />
            <TopNavLink to="/queue/history" label="Best times" />
            <TopNavLink to="/admin/login" label="Admin sign in" icon={<BellRing size={14} />} emphasize />
          </nav>
        </div>
      </header>

      <main className="grid gap-5">{children}</main>

      <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          QFlow now uses live queue updates when the socket is connected, and falls back to scheduled refreshes if the connection drops.
        </p>
        <div className="flex items-center gap-3 text-sm text-muted">
          {connectionState ? <ConnectionStatusBadge state={connectionState} /> : null}
        </div>
      </Card>
    </div>
  );
}

function TopNavLink({
  to,
  label,
  icon,
  emphasize = false
}: {
  to: string;
  label: string;
  icon?: ReactNode;
  emphasize?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold shadow-sm transition duration-200 ${
        emphasize
          ? 'border-brand-600 bg-brand-600 text-white hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-md'
          : 'border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 hover:shadow-md'
      }`}
      aria-label={label}
    >
      {icon}
      {label}
    </Link>
  );
}
