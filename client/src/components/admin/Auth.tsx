import type { ReactNode } from 'react';

import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export function LoginForm() {
  return (
    <Card>
      <p className="text-sm text-slate-500">LoginForm</p>
      <div className="mt-4 grid gap-4">
        <Input placeholder="Username" />
        <Input placeholder="Password" type="password" />
        <Button>Admin Login Placeholder</Button>
      </div>
    </Card>
  );
}

export function AuthGuard({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function LogoutButton() {
  return <Button variant="secondary">Logout Placeholder</Button>;
}
