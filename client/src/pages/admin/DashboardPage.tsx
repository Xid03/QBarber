import { MiniChart, QuickActionPanel, StatCard } from '../../components/admin/DashboardWidgets';
import { AdminLayout } from '../../components/layout/AdminLayout';

export function DashboardPage() {
  return (
    <AdminLayout>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Served Today" />
        <StatCard title="Average Wait Time" />
        <StatCard title="In Queue" />
        <StatCard title="Revenue Estimate" />
      </div>
      <MiniChart />
      <QuickActionPanel />
    </AdminLayout>
  );
}
