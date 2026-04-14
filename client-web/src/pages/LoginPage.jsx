import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Field, Icon, Input, StatusBadge } from '../components/AdminUI';
import QueueSmartLogo from '../components/QueueSmartLogo';
import { useApp } from '../context/AppContext';
import { dashboardStats, demoCredentials } from '../services/mockData';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, notify } = useApp();
  const [form, setForm] = useState({
    email: demoCredentials.email,
    password: demoCredentials.password,
    remember: true
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = login(form);

    if (result.ok) {
      navigate('/dashboard');
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-app px-4 py-12 sm:px-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-7rem] top-[-9rem] h-72 w-72 rounded-full bg-brand/25 blur-3xl" />
        <div className="absolute bottom-[-8rem] right-[-8rem] h-96 w-96 rounded-full bg-amber-400/[0.12] blur-3xl" />
      </div>

      <div className="relative grid w-full max-w-6xl gap-6 lg:grid-cols-[1.05fr,0.95fr]">
        <Card className="overflow-hidden p-0">
          <div className="border-b border-slate-200 px-8 py-8">
            <div className="flex items-center gap-4">
              <QueueSmartLogo className="h-16 w-16 shrink-0" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand/80">QBarber</p>
                <h1 className="mt-4 max-w-lg text-5xl font-bold tracking-tight text-slate-950">
                  Barbershop operations with a live queue brain.
                </h1>
              </div>
            </div>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
              This Phase 1 preview focuses on interface design only: queue visibility, barber flow,
              premium bookings, analytics, and settings are all wired with realistic mock data.
            </p>
          </div>

          <div className="grid gap-4 px-8 py-8 sm:grid-cols-2">
            {dashboardStats.map((stat) => (
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5" key={stat.id}>
                <StatusBadge tone={stat.tone}>{stat.label}</StatusBadge>
                <p className="mt-4 text-3xl font-bold text-slate-950">{stat.value}</p>
                <p className="mt-2 text-sm text-slate-600">{stat.delta}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 border-t border-slate-200 px-8 py-8 sm:grid-cols-3">
            {[
              'Queue command center with live sorting and action controls',
              'Barber roster management, assignments, and shift status',
              'Booking calendar, analytics, and settings for multi-branch growth'
            ].map((feature) => (
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4" key={feature}>
                <div className="mb-3 inline-flex rounded-2xl border border-brand/20 bg-brand/10 p-2 text-brand">
                  <Icon className="h-5 w-5" name="spark" />
                </div>
                <p className="text-sm leading-6 text-slate-600">{feature}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card
          description="Use the demo credentials below to open the full admin preview."
          title="Admin Login"
        >
          <form className="space-y-5" onSubmit={handleSubmit}>
            <Field label="Email address">
              <Input
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="owner@qbarber.demo"
                type="email"
                value={form.email}
              />
            </Field>

            <Field label="Password">
              <Input
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="********"
                type="password"
                value={form.password}
              />
            </Field>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="inline-flex items-center gap-3 text-sm text-slate-600">
                <input
                  checked={form.remember}
                  className="h-4 w-4 rounded border-slate-300 bg-white text-brand"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, remember: event.target.checked }))
                  }
                  type="checkbox"
                />
                Remember me
              </label>

              <button
                className="text-sm font-semibold text-brand transition hover:text-blue-300"
                onClick={() =>
                  notify({
                    title: 'Password reset flow',
                    message: 'Password reset is mocked for the UI phase and will be wired in Phase 2.',
                    tone: 'warning'
                  })
                }
                type="button"
              >
                Forgot password?
              </button>
            </div>

            <Button className="w-full" size="lg" type="submit">
              <Icon name="check" />
              Sign in to dashboard
            </Button>
          </form>

          <div className="mt-6 rounded-[28px] border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Demo credentials</p>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>
                <span className="text-slate-500">Email:</span> {demoCredentials.email}
              </p>
              <p>
                <span className="text-slate-500">Password:</span> {demoCredentials.password}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
