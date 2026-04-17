import type { PropsWithChildren, ReactNode } from 'react';
import { MoonStar, SunMedium } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import { Logo } from '../Logo';
import { useAdminAuth } from '../../features/admin/auth-context';
import type { LiveConnectionState } from '../../features/realtime/socket-provider';
import { useTheme } from '../../features/theme/theme-provider';
import { LogoutButton } from '../admin/Auth';
import { ConnectionStatusBadge } from '../ui/ConnectionStatusBadge';

type AdminLayoutProps = PropsWithChildren<{
  title: string;
  description: string;
  actions?: ReactNode;
  connectionState?: LiveConnectionState;
}>;

export function AdminLayout({ children, title, description, actions, connectionState }: AdminLayoutProps) {
  const location = useLocation();
  const { session } = useAdminAuth();
  const { theme, toggleTheme } = useTheme();
  const avatarLetter = session?.admin.displayName?.charAt(0).toUpperCase() ?? 'A';

  return (
    <div className="admin-shell page-shell min-h-screen bg-slate-50 text-slate-950">
      <div className="admin-shell-surface min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.08),transparent_22%),radial-gradient(circle_at_top_right,rgba(148,163,184,0.16),transparent_24%),linear-gradient(180deg,#f8fafc_0%,#f8fafc_18%,#f1f5f9_100%)]">
        <header className="admin-header sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 text-slate-900 shadow-sm backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 lg:px-6">
            <div className="flex items-center gap-6">
              <Link to="/admin/dashboard" className="flex items-center gap-3">
                <div className="admin-brand-card rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                  <Logo size={42} />
                </div>
                <div>
                  <p className="text-sm font-semibold tracking-tight text-slate-900">QFlow Admin</p>
                  <p className="text-xs text-slate-500">Queue control hub</p>
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
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                className="admin-theme-toggle inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-950"
              >
                {theme === 'dark' ? <SunMedium size={16} /> : <MoonStar size={16} />}
                <span className="hidden sm:inline">{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
              </button>
              {connectionState ? <ConnectionStatusBadge state={connectionState} /> : null}
              <div className="hidden md:block">
                <LogoutButton />
              </div>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-slate-900">{session?.shop.name}</p>
                <p className="text-xs text-slate-500">{session?.admin.displayName}</p>
              </div>
              <div className="admin-avatar flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white shadow-sm">
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

          <nav className="admin-mobile-nav mb-4 flex items-center gap-2 overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/90 p-2 shadow-sm md:hidden">
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
      className={`admin-nav-link inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium whitespace-nowrap transition ${
        isActive
          ? 'admin-nav-link-active bg-primary-600 text-white shadow-md'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
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
      className={`admin-nav-link rounded-lg px-3 py-2 text-sm font-medium transition ${
        isActive
          ? 'admin-nav-link-active bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-100'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
      }`}
    >
      {label}
    </Link>
  );
}
