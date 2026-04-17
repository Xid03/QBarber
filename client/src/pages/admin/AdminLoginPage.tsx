import { LoginForm } from '../../components/admin/Auth';
import { useAdminAuth } from '../../features/admin/auth-context';
import { Logo } from '../../components/Logo';
import { Navigate } from 'react-router-dom';

export function AdminLoginPage() {
  const { session } = useAdminAuth();

  if (session) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <div className="page-shell flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 sm:py-10">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(420px,520px)] lg:items-center">
        <section className="hidden rounded-[32px] border border-slate-200/80 bg-white/85 p-8 shadow-soft backdrop-blur lg:block">
          <div className="max-w-xl space-y-6">
            <div className="flex items-center gap-4">
              <Logo size={60} />
              <div>
                <p className="section-label">QFlow Admin</p>
                <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
                  Sign in to run the shop without the queue chaos.
                </h1>
              </div>
            </div>
            <p className="text-base leading-7 text-slate-600">
              Manage walk-ins, monitor live queue movement, update service settings, and keep the
              customer flow moving from one admin workspace.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-600">
                  Live queue
                </p>
                <p className="mt-3 text-sm text-slate-600">
                  Start, complete, or cancel services with instant updates reflected on the public
                  queue.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-600">
                  Shop controls
                </p>
                <p className="mt-3 text-sm text-slate-600">
                  Update hours, service menu details, and admin access from the same dashboard.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <LoginForm />
        </section>
      </div>
    </div>
  );
}
