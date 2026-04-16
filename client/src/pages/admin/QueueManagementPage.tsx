import { AddCustomerForm, AdminQueueTable, CustomerDetailModal } from '../../components/admin/QueueManagement';
import { AdminLayout } from '../../components/layout/AdminLayout';

export function QueueManagementPage() {
  return (
    <AdminLayout>
      <AdminQueueTable />
      <AddCustomerForm />
      <CustomerDetailModal />
    </AdminLayout>
  );
}
