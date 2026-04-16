import { LoginForm } from '../../components/admin/Auth';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { useAdminAuth } from '../../features/admin/auth-context';
import { Navigate } from 'react-router-dom';

export function AdminLoginPage() {
  const { session } = useAdminAuth();

  if (session) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <PublicLayout>
      <LoginForm />
    </PublicLayout>
  );
}
