import type { PropsWithChildren } from 'react';

import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';

export function PublicLayout({ children }: PropsWithChildren) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6">
      <header className="flex items-center justify-between rounded-lg bg-white px-5 py-4 shadow-soft">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600">QFlow</p>
          <h1 className="mt-2 text-2xl font-bold">Customer Queue View</h1>
        </div>
        <StatusBadge label="Design Placeholder" />
      </header>
      <main className="grid gap-6">{children}</main>
      <Card>
        <p className="text-sm text-slate-500">Footer placeholder for last updated timestamp and helpful links.</p>
      </Card>
    </div>
  );
}
