import type { PropsWithChildren } from 'react';

import { Card } from '../ui/Card';

export function AdminLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[260px,1fr] lg:px-6">
        <aside className="rounded-lg bg-slate-950 p-5 text-white shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-100">QFlow Admin</p>
          <p className="mt-4 text-sm text-slate-300">Sidebar placeholder for dashboard, queue, analytics, and settings.</p>
        </aside>
        <div className="grid gap-6">
          <Card>
            <h1 className="text-2xl font-bold">Admin Workspace Placeholder</h1>
          </Card>
          {children}
        </div>
      </div>
    </div>
  );
}
