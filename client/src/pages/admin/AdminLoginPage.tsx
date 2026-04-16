import { LoginForm } from '../../components/admin/Auth';
import { PublicLayout } from '../../components/layout/PublicLayout';

export function AdminLoginPage() {
  return (
    <PublicLayout>
      <LoginForm />
    </PublicLayout>
  );
}
