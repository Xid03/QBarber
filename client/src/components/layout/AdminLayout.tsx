import type { PropsWithChildren, ReactNode } from 'react';
import { Scissors } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import { useAdminAuth } from '../../features/admin/auth-context';
import { LogoutButton } from '../admin/Auth';

type AdminLayoutProps = PropsWithChildren<{
  title: string;
  description: string;
  actions?: ReactNode;
}>;

export function AdminLayout({ children, title, description, actions }: AdminLayoutProps) {
  const location = useLocation();
  const { session } = useAdminAuth();
  const avatarLetter = session?.admin.displayName?.charAt(0).toUpperCase() ?? 'A';

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#5b31f4_0%,#6f46ff_28%,#f5f7ff_28.1%,#eef2ff_100%)] text-slate-950">
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.32),transparent_24%),radial-gradient(circle_at_top_right,rgba(147,197,253,0.18),transparent_20%)]">
        <header className="border-b border-white/10 bg-slate-950/95 text-white shadow-[0_18px_48px_rgba(15,23,42,0.22)] backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 lg:px-6">
            <div className="flex items-center gap-6">
              <Link to="/admin/dashboard" className="flex items-center gap-3">
                <div className="rounded-xl bg-[#5b31f4] p-2.5 text-white shadow-[0_10px_24px_rgba(91,49,244,0.4)]">
                  <Scissors size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold tracking-tight">QFlow Admin</p>
                  <p className="text-xs text-slate-400">Queue control hub</p>
                </div>
              </Link>

              <nav className="hidden items-center gap-1 md:flex">
                <TopNavLink
                  to="/admin/dashboard"
                  label="Dashboard"
                  isActive={location.pathname === '/admin/dashboard'}
                />
                <TopNavLink to="/admin/queue" label="Queue" isActive={location.pathname === '/admin/queue'} />
                <TopNavLink
                  to="/admin/analytics"
                  label="Analytics"
                  isActive={location.pathname === '/admin/analytics'}
                />
                <TopNavLink
                  to="/admin/settings"
                  label="Settings"
                  isActive={location.pathname === '/admin/settings'}
                />
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:block">
                <LogoutButton />
              </div>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-slate-100">{session?.shop.name}</p>
                <p className="text-xs text-slate-400">{session?.admin.displayName}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5b31f4] text-sm font-semibold text-white">
                {avatarLetter}
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950">{title}</h1>
              <p className="mt-2 text-sm text-slate-500 sm:text-base">{description}</p>
            </div>
            {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
          </div>

          <nav className="mb-4 flex items-center gap-2 overflow-x-auto rounded-2xl bg-white/70 p-2 shadow-soft md:hidden">
            <SidebarLink
              to="/admin/dashboard"
              label="Dashboard"
              isActive={location.pathname === '/admin/dashboard'}
            />
            <SidebarLink
              to="/admin/queue"
              label="Queue"
              isActive={location.pathname === '/admin/queue'}
            />
            <SidebarLink
              to="/admin/analytics"
              label="Analytics"
              isActive={location.pathname === '/admin/analytics'}
            />
            <SidebarLink
              to="/admin/settings"
              label="Settings"
              isActive={location.pathname === '/admin/settings'}
            />
            <div className="ml-auto">
              <LogoutButton />
            </div>
          </nav>

          <div className="grid gap-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

function SidebarLink({
  to,
  label,
  isActive
}: {
  to: string;
  label: string;
  isActive: boolean;
}) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium whitespace-nowrap transition ${
        isActive
          ? 'bg-[#5b31f4] text-white shadow-[0_10px_24px_rgba(91,49,244,0.24)]'
          : 'text-slate-600 hover:bg-white hover:text-slate-950'
      }`}
    >
      {label}
    </Link>
  );
}

function TopNavLink({
  to,
  label,
  isActive
}: {
  to: string;
  label: string;
  isActive: boolean;
}) {
  return (
    <Link
      to={to}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
        isActive ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'
      }`}
    >
      {label}
    </Link>
  );
}
