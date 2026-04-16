import type { PropsWithChildren, ReactNode } from 'react';
import { BellRing, Clock3, MapPin, Phone, Scissors } from 'lucide-react';
import { Link } from 'react-router-dom';

import type { ShopMetadata } from '../../features/public/types';
import { formatUpdatedAt } from '../../features/public/formatters';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';

type PublicLayoutProps = PropsWithChildren<{
  shop?: ShopMetadata;
  lastUpdated?: Date;
  actions?: ReactNode;
}>;

export function PublicLayout({ children, shop, lastUpdated, actions }: PublicLayoutProps) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-5 px-4 py-4 sm:px-6 sm:py-6">
      <header className="glass-panel overflow-hidden rounded-lg shadow-soft">
        <div className="flex flex-col gap-5 px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-soft">
                  <Scissors size={22} />
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
            <TopNavLink to="/admin/login" label="Admin sign in" icon={<BellRing size={14} />} />
          </nav>
        </div>
      </header>

      <main className="grid gap-5">{children}</main>

      <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          QFlow keeps this page fresh with regular check-ins, so customers can judge the queue before
          they leave home.
        </p>
        <div className="flex items-center gap-3 text-sm text-muted">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-success-600" />
          <span>Polling every 30 seconds on public views</span>
        </div>
      </Card>
    </div>
  );
}

function TopNavLink({ to, label, icon }: { to: string; label: string; icon?: ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:bg-white"
    >
      {icon}
      {label}
    </Link>
  );
}
