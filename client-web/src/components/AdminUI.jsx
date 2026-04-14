import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import QueueSmartLogo from './QueueSmartLogo';
import { useApp } from '../context/AppContext';
import { demoOwner } from '../services/mockData';

const iconPaths = {
  dashboard: 'M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z',
  queue: 'M4 6h16M4 12h16M4 18h12',
  barbers: 'M9 3h6l1 4-4 4 2 8h-4l2-8-4-4 1-4Z',
  bookings: 'M7 2v3M17 2v3M4 8h16M5 5h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z',
  analytics: 'M5 19V9M12 19V5M19 19v-8',
  settings: 'm12 8.5 1.4 2.8 3.1.5-.9 3 2.1 2.2-2.4 2 1.1 2.9-3.1.2L12 20l-1.4-2.9-3.1-.2 1.1-2.9-2.4-2 2.1-2.2-.9-3 3.1-.5L12 8.5Z',
  bell: 'M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10 20a2 2 0 0 0 4 0',
  shop: 'M4 10h16v10H4V10Zm1-6h14l1 6H4l1-6Z',
  search: 'm21 21-4.35-4.35M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  menu: 'M4 6h16M4 12h16M4 18h16',
  close: 'm18 6-12 12M6 6l12 12',
  plus: 'M12 5v14M5 12h14',
  spark: 'm12 3 1.9 4.6L18.5 9l-4.6 1.4L12 15l-1.9-4.6L5.5 9l4.6-1.4L12 3Z',
  users: 'M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M16 3.1a4 4 0 0 1 0 7.8M9.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm9.5 9.9v-2a4 4 0 0 0-3-3.9',
  clock: 'M12 6v6l4 2M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z',
  wallet: 'M3 7.5A2.5 2.5 0 0 1 5.5 5H19a2 2 0 0 1 2 2v1H5.5A2.5 2.5 0 0 0 3 10.5v6A2.5 2.5 0 0 0 5.5 19H21v1a2 2 0 0 1-2 2H5.5A2.5 2.5 0 0 1 3 19.5v-12ZM21 9H5.5A1.5 1.5 0 0 0 4 10.5v6A1.5 1.5 0 0 0 5.5 18H21V9Zm-4 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z',
  star: 'm12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.2 6.4 20.2l1.1-6.2L3 9.6l6.2-.9L12 3Z',
  funnel: 'M3 5h18l-7 8v5l-4 2v-7L3 5Z',
  export: 'M12 16V4M7 9l5-5 5 5M5 20h14',
  check: 'm20 6-11 11-5-5',
  pencil: 'm3 21 3.8-1 11-11a2.1 2.1 0 0 0-3-3l-11 11L3 21Z'
};

export const adminNavigation = [
  { to: '/dashboard', label: 'Overview', icon: 'dashboard', description: 'Live operations pulse' },
  { to: '/queue', label: 'Queue', icon: 'queue', description: 'Call and manage customers' },
  { to: '/barbers', label: 'Barbers', icon: 'barbers', description: 'Roster and assignments' },
  { to: '/bookings', label: 'Bookings', icon: 'bookings', description: 'Premium slot calendar' },
  { to: '/analytics', label: 'Analytics', icon: 'analytics', description: 'Traffic and revenue' },
  { to: '/settings', label: 'Settings', icon: 'settings', description: 'Shop rules and templates' }
];

const toneClasses = {
  brand: 'border-brand/20 bg-brand/10 text-brand',
  success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700',
  warning: 'border-amber-500/20 bg-amber-500/10 text-amber-700',
  danger: 'border-rose-500/20 bg-rose-500/10 text-rose-700',
  slate: 'border-slate-200 bg-slate-100 text-slate-700'
};

export function Icon({ name, className = 'h-5 w-5' }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.75"
      viewBox="0 0 24 24"
    >
      <path d={iconPaths[name] ?? iconPaths.spark} />
    </svg>
  );
}

export function Button({
  children,
  tone = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  ...props
}) {
  const tones = {
    primary:
      'bg-brand text-white shadow-[0_20px_40px_-18px_rgba(37,99,235,0.8)] hover:bg-blue-500',
    secondary:
      'border border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    success:
      'bg-emerald-500/90 text-slate-950 shadow-[0_20px_40px_-18px_rgba(16,185,129,0.38)] hover:bg-emerald-400',
    danger: 'bg-rose-500/90 text-white hover:bg-rose-400'
  };

  const sizes = {
    sm: 'h-10 px-4 text-sm',
    md: 'h-11 px-5 text-sm',
    lg: 'h-12 px-6 text-sm'
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-24px_rgba(15,23,42,0.45)] active:translate-y-0 active:scale-[0.99] ${tones[tone]} ${sizes[size]} ${className}`}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}

export function StatusBadge({ children, tone = 'slate' }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${toneClasses[tone]}`}>
      {children}
    </span>
  );
}

export function Card({ title, description, action, className = '', children }) {
  return (
    <section className={`rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-soft transition-all duration-300 ease-out hover:-translate-y-1 hover:border-slate-300 ${className}`}>
      {(title || description || action) && (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h3 className="text-lg font-semibold text-slate-950">{title}</h3>}
            {description && <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatCard({ label, value, delta, tone = 'brand', icon = 'spark' }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">{label}</p>
          <p className="mt-4 text-4xl font-bold tracking-tight text-slate-950">{value}</p>
          <p className="mt-2 text-sm text-slate-600">{delta}</p>
        </div>
        <div className={`rounded-3xl border p-3 ${toneClasses[tone]}`}>
          <Icon className="h-6 w-6" name={icon} />
        </div>
      </div>
    </Card>
  );
}

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand/80">{eyebrow}</p>
        )}
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">{title}</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">{description}</p>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}

export function Field({ label, hint, children }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      {children}
      {hint && <span className="block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

export function Input(props) {
  return (
    <input
      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand/50 focus:bg-slate-50"
      {...props}
    />
  );
}

export function Select(props) {
  return (
    <select
      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand/50"
      {...props}
    />
  );
}

export function TextArea(props) {
  return (
    <textarea
      className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand/50"
      {...props}
    />
  );
}

export function Toggle({ checked, onChange, label }) {
  return (
    <button
      className={`inline-flex items-center gap-3 rounded-full border px-2 py-2 text-sm transition ${
        checked ? 'border-brand/30 bg-brand/10 text-slate-950' : 'border-slate-200 bg-white text-slate-600'
      }`}
      onClick={() => onChange(!checked)}
      type="button"
    >
      <span
        className={`relative h-6 w-11 rounded-full transition ${
          checked ? 'bg-brand' : 'bg-slate-300'
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            checked ? 'left-6' : 'left-1'
          }`}
        />
      </span>
      <span>{label}</span>
    </button>
  );
}

export function SegmentedControl({ options, value, onChange }) {
  return (
    <div className="inline-flex flex-wrap gap-2 rounded-3xl border border-slate-200 bg-white/80 p-2">
      {options.map((option) => (
        <button
          className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
            value === option
              ? 'bg-brand text-white shadow-[0_18px_35px_-18px_rgba(37,99,235,0.9)]'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
          key={option}
          onClick={() => onChange(option)}
          type="button"
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export function DataTable({
  title,
  description,
  columns,
  rows,
  actions,
  pageSize = 5,
  searchPlaceholder = 'Search records',
  emptyMessage = 'Nothing to show yet.'
}) {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState(columns.find((column) => column.sortable !== false)?.key ?? '');
  const [sortDirection, setSortDirection] = useState('asc');
  const [page, setPage] = useState(1);

  let filteredRows = rows.filter((row) => {
    if (!query.trim()) {
      return true;
    }

    const haystack = Object.values(row)
      .join(' ')
      .toLowerCase();

    return haystack.includes(query.trim().toLowerCase());
  });

  const activeColumn = columns.find((column) => column.key === sortKey);

  if (activeColumn) {
    filteredRows = [...filteredRows].sort((left, right) => {
      const leftValue = activeColumn.sortValue ? activeColumn.sortValue(left) : left[sortKey];
      const rightValue = activeColumn.sortValue ? activeColumn.sortValue(right) : right[sortKey];

      if (typeof leftValue === 'number' && typeof rightValue === 'number') {
        return sortDirection === 'asc' ? leftValue - rightValue : rightValue - leftValue;
      }

      const leftText = String(leftValue ?? '').toLowerCase();
      const rightText = String(rightValue ?? '').toLowerCase();

      return sortDirection === 'asc'
        ? leftText.localeCompare(rightText)
        : rightText.localeCompare(leftText);
    });
  }

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const visibleRows = filteredRows.slice(startIndex, startIndex + pageSize);

  const handleSort = (column) => {
    if (column.sortable === false) {
      return;
    }

    if (sortKey === column.key) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(column.key);
      setSortDirection('asc');
    }
  };

  return (
    <Card
      action={actions}
      description={description}
      title={title}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" name="search" />
          <Input
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder={searchPlaceholder}
            value={query}
          />
        </div>
        <p className="text-sm text-slate-500">
          Showing {filteredRows.length === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + pageSize, filteredRows.length)} of {filteredRows.length}
        </p>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-slate-50">
              <tr>
                {columns.map((column) => (
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.24em] text-slate-500"
                    key={column.key}
                  >
                    <button
                      className={`inline-flex items-center gap-2 ${column.sortable === false ? 'cursor-default' : 'hover:text-slate-900'}`}
                      onClick={() => handleSort(column)}
                      type="button"
                    >
                      {column.label}
                      {column.sortable !== false && sortKey === column.key && (
                        <span className="text-[10px]">{sortDirection === 'asc' ? 'ASC' : 'DESC'}</span>
                      )}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleRows.length === 0 && (
                <tr>
                  <td className="px-4 py-10 text-center text-sm text-slate-400" colSpan={columns.length}>
                    {emptyMessage}
                  </td>
                </tr>
              )}
              {visibleRows.map((row) => (
                <tr className="border-t border-slate-200 transition-colors duration-200 hover:bg-slate-50/80" key={row.id ?? row.key}>
                  {columns.map((column) => (
                    <td className="px-4 py-4 align-top text-sm text-slate-700" key={`${row.id}-${column.key}`}>
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-slate-500">Sorted by {activeColumn?.label ?? 'default order'}</p>
        <div className="flex items-center gap-2">
          <Button
            disabled={currentPage <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            size="sm"
            tone="secondary"
          >
            Previous
          </Button>
          <span className="text-sm text-slate-500">
            Page {currentPage} / {totalPages}
          </span>
          <Button
            disabled={currentPage >= totalPages}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            size="sm"
            tone="secondary"
          >
            Next
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function Modal({ open, title, description, children, onClose }) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/25 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold text-slate-950">{title}</h3>
            {description && <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>}
          </div>
          <Button onClick={onClose} size="sm" tone="ghost">
            <Icon name="close" />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ToastViewport() {
  const { toasts } = useApp();

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[60] flex w-full max-w-sm flex-col gap-3">
      {toasts.map((toast) => (
        <div
          className={`pointer-events-auto rounded-3xl border bg-white p-4 shadow-soft ${toneClasses[toast.tone] ?? toneClasses.brand}`}
          key={toast.id}
        >
          <p className="text-sm font-semibold text-slate-950">{toast.title}</p>
          <p className="mt-1 text-sm text-slate-600">{toast.message}</p>
        </div>
      ))}
    </div>
  );
}

function SidebarContent({ onNavigate }) {
  const { session, logout } = useApp();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 rounded-[28px] border border-slate-200 bg-white/90 p-5">
        <div className="flex items-center gap-4">
          <QueueSmartLogo className="h-14 w-14 shrink-0" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand/70">QBarber</p>
            <h2 className="mt-2 text-xl font-bold text-slate-950">{demoOwner.shopName}</h2>
          </div>
        </div>
        <div className="mt-5 flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand/10 text-sm font-semibold text-brand">
            {session?.avatar ?? demoOwner.avatar}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-950">{session?.name ?? demoOwner.name}</p>
            <p className="text-sm text-slate-500">{session?.role ?? demoOwner.role}</p>
          </div>
        </div>
      </div>

      <nav className="mt-6 flex-1 min-h-0 space-y-2 overflow-y-auto pr-2">
        {adminNavigation.map((item) => (
          <NavLink
            className={({ isActive }) =>
              `group flex items-center justify-between rounded-[24px] border px-4 py-4 transition-all duration-300 ease-out hover:-translate-y-0.5 ${
                isActive
                  ? 'border-brand/20 bg-brand/[0.08] text-slate-950'
                  : 'border-transparent bg-transparent text-slate-600 hover:border-slate-200 hover:bg-white hover:text-slate-950'
              }`
            }
            key={item.to}
            onClick={onNavigate}
            to={item.to}
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <span
                    className={`grid h-11 w-11 place-items-center rounded-2xl border ${
                      isActive ? 'border-brand/30 bg-brand/10 text-brand' : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    <Icon className="h-5 w-5" name={item.icon} />
                  </span>
                  <div>
                    <p className="font-semibold">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.description}</p>
                  </div>
                </div>
                <span className="text-slate-500 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-slate-700">&gt;</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <button
        className="mt-6 inline-flex shrink-0 items-center gap-3 rounded-[24px] border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
        onClick={logout}
        type="button"
      >
        <Icon name="logout" />
        Log out
      </button>
    </div>
  );
}

export function AdminShell({ children }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const activeNav = adminNavigation.find((item) => location.pathname.startsWith(item.to)) ?? adminNavigation[0];

  return (
    <div className="relative min-h-screen overflow-hidden bg-app">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] top-[-10rem] h-72 w-72 rounded-full bg-brand/15 blur-3xl" />
        <div className="absolute right-[-8rem] top-20 h-80 w-80 rounded-full bg-cyan-400/[0.12] blur-3xl" />
        <div className="absolute bottom-[-10rem] left-1/3 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
      </div>

      <aside className="fixed bottom-0 left-0 top-0 z-40 hidden w-[300px] overflow-hidden border-r border-slate-200 bg-white/80 px-5 py-6 backdrop-blur-xl lg:block">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm lg:hidden">
          <div className="h-full w-[300px] overflow-hidden border-r border-slate-200 bg-white/95 px-5 py-6">
            <div className="mb-4 flex justify-end">
              <Button onClick={() => setSidebarOpen(false)} size="sm" tone="ghost">
                <Icon name="close" />
              </Button>
            </div>
            <SidebarContent onNavigate={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="relative lg:pl-[300px]">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button className="lg:hidden" onClick={() => setSidebarOpen(true)} size="sm" tone="secondary">
                <Icon name="menu" />
              </Button>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-500">Admin panel</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">{activeNav.label}</h2>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="hidden items-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3 sm:flex">
                <Icon className="h-4 w-4 text-slate-500" name="search" />
                <span className="text-sm text-slate-500">Search customers, barbers, bookings</span>
              </div>
              <StatusBadge tone="success">Live queue synced</StatusBadge>
              <StatusBadge tone="warning">Next rush: 4:00 PM</StatusBadge>
            </div>
          </div>
        </header>

        <main className="relative px-4 py-8 sm:px-6 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
