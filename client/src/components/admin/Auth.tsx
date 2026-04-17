import { zodResolver } from '@hookform/resolvers/zod';
import { useState, type ReactNode } from 'react';
import { Eye, EyeOff, LockKeyhole, LogOut } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { Logo } from '../Logo';
import { useAdminAuth } from '../../features/admin/auth-context';
import { getAdminApiErrorMessage, loginAdmin } from '../../features/admin/hooks';
import { useToast } from '../../features/feedback/toast-provider';
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
  const { showToast } = useToast();
  const form = useForm<AdminLoginValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      username: '',
      password: ''
    }
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const nextPath = (location.state as { from?: string } | null)?.from || '/admin/dashboard';

  return (
    <Card className="mx-auto max-w-xl space-y-6">
      <div className="flex items-start gap-4">
        <div className="shrink-0 shadow-soft">
          <Logo size={52} />
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
              showToast({
                title: 'Signed in successfully',
                message: `Welcome back to ${session.shop.name}.`
              });
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
          <div className="relative">
            <Input
              placeholder="Enter your password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              className="pr-12"
              {...form.register('password')}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-3 inline-flex items-center text-slate-500 transition hover:text-slate-700"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => {
                setShowPassword((current) => !current);
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
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
      className="admin-logout-button inline-flex items-center gap-2 rounded-xl border-slate-200 bg-slate-50/90 px-3.5 py-2.5 text-slate-700 shadow-sm hover:bg-white hover:shadow-md"
      aria-label="Sign out of the admin dashboard"
      onClick={() => {
        logout();
        navigate('/admin/login', { replace: true });
      }}
    >
      <LogOut size={16} />
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
