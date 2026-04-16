import { zodResolver } from '@hookform/resolvers/zod';
import { useState, type ReactNode } from 'react';
import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { useAdminAuth } from '../../features/admin/auth-context';
import { getAdminApiErrorMessage, loginAdmin } from '../../features/admin/hooks';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';

const adminLoginSchema = z.object({
  username: z.string().trim().min(3, 'Username is required.'),
  password: z.string().min(6, 'Password is required.')
});

type AdminLoginValues = z.infer<typeof adminLoginSchema>;

export function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSession } = useAdminAuth();
  const form = useForm<AdminLoginValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      username: 'admin',
      password: 'password'
    }
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const nextPath = (location.state as { from?: string } | null)?.from || '/admin/dashboard';

  return (
    <Card className="mx-auto max-w-xl space-y-6">
      <div className="flex items-start gap-4">
        <div className="rounded-3xl bg-slate-900 p-3 text-white">
          <ShieldCheck size={22} />
        </div>
        <div>
          <p className="section-label">Admin sign in</p>
          <h2 className="mt-2 text-2xl font-semibold">Keep the queue moving from one control room.</h2>
          <p className="mt-2 text-sm text-muted">
            Use the seeded admin account for this phase: `admin` / `password`.
          </p>
        </div>
      </div>

      <form
        className="grid gap-5"
        onSubmit={(event) => {
          void form.handleSubmit(async (values) => {
            try {
              setErrorMessage(null);
              const session = await loginAdmin(values);
              setSession(session);
              navigate(nextPath, { replace: true });
            } catch (error) {
              setErrorMessage(getAdminApiErrorMessage(error));
            }
          })(event);
        }}
      >
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Username</span>
          <Input placeholder="admin" {...form.register('username')} />
          <FieldError message={form.formState.errors.username?.message} />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Password</span>
          <Input placeholder="password" type="password" {...form.register('password')} />
          <FieldError message={form.formState.errors.password?.message} />
        </label>

        {errorMessage ? (
          <div className="rounded-2xl border border-danger-100 bg-danger-100/60 px-4 py-3 text-sm text-danger-600">
            {errorMessage}
          </div>
        ) : null}

        <Button type="submit" className="inline-flex items-center justify-center gap-2" disabled={form.formState.isSubmitting}>
          <LockKeyhole size={16} />
          {form.formState.isSubmitting ? 'Signing in...' : 'Open admin dashboard'}
        </Button>
      </form>
    </Card>
  );
}

export function AuthGuard({ children }: { children: ReactNode }) {
  const { session } = useAdminAuth();
  const location = useLocation();

  if (!session) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

export function LogoutButton() {
  const navigate = useNavigate();
  const { logout } = useAdminAuth();

  return (
    <Button
      variant="secondary"
      onClick={() => {
        logout();
        navigate('/admin/login', { replace: true });
      }}
    >
      Sign out
    </Button>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-danger-600">{message}</p>;
}
