import { BarberManager, OperatingHoursEditor, ServiceTypeManager } from '../../components/admin/SettingsWidgets';
import { AdminLayout } from '../../components/layout/AdminLayout';

export function SettingsPage() {
  return (
    <AdminLayout>
      <OperatingHoursEditor />
      <ServiceTypeManager />
      <BarberManager />
    </AdminLayout>
  );
}
