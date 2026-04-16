import { AuthGuard } from '../../components/admin/Auth';
import { BarberManager, OperatingHoursEditor, ServiceTypeManager } from '../../components/admin/SettingsWidgets';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { ErrorStateCard, QueueLoadingCard } from '../../components/public/QueueComponents';
import { useAdminAuth } from '../../features/admin/auth-context';
import { getAdminApiErrorMessage, useSettings } from '../../features/admin/hooks';

export function SettingsPage() {
  const { session } = useAdminAuth();
  const { settingsQuery, updateStatusMutation } = useSettings(session?.shop.id, session?.token);

  if (!session) {
    return null;
  }

  const content =
    settingsQuery.isLoading || !settingsQuery.data ? (
      <QueueLoadingCard label="Settings" />
    ) : settingsQuery.isError ? (
      <ErrorStateCard
        title="Settings could not be loaded."
        message={getAdminApiErrorMessage(settingsQuery.error)}
        onRetry={() => {
          void settingsQuery.refetch();
        }}
      />
    ) : (
      <div className="grid gap-4 xl:grid-cols-[1fr,1fr]">
        <OperatingHoursEditor settings={settingsQuery.data} />
        <ServiceTypeManager settings={settingsQuery.data} />
        <BarberManager
          settings={settingsQuery.data}
          onToggleStatus={() => {
            updateStatusMutation.mutate(settingsQuery.data.status !== 'OPEN');
          }}
          isUpdating={updateStatusMutation.isPending}
        />
      </div>
    );

  return (
    <AuthGuard>
      <AdminLayout
        title="Settings"
        description="Review the current storefront state, service menu, operating hours, and roster from one page."
      >
        {content}
      </AdminLayout>
    </AuthGuard>
  );
}
