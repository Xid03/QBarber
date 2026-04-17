import { AuthGuard } from '../../components/admin/Auth';
import {
  AdminAccessManager,
  OperatingHoursEditor,
  ServiceTypeManager
} from '../../components/admin/SettingsManagerWidgets';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { ErrorStateCard, QueueLoadingCard } from '../../components/public/QueueComponents';
import { useAdminAuth } from '../../features/admin/auth-context';
import { useToast } from '../../features/feedback/toast-provider';
import { getAdminApiErrorMessage, useSettings } from '../../features/admin/hooks';
import { useRealtimeShopSync } from '../../features/realtime/hooks';

export function SettingsPage() {
  const { session } = useAdminAuth();
  const { showToast } = useToast();
  const { connectionState } = useRealtimeShopSync({
    shopId: session?.shop.id,
    audience: 'admin'
  });
  const {
    settingsQuery,
    updateStatusMutation,
    updateOperatingHoursMutation,
    createAdminMutation,
    updateAdminMutation,
    updateAdminStatusMutation,
    deleteAdminMutation,
    updateServiceTypeMutation
  } = useSettings(session?.shop.id, session?.token);

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
        <OperatingHoursEditor
          settings={settingsQuery.data}
          onToggleStatus={() => {
            updateStatusMutation.mutate(settingsQuery.data.status !== 'OPEN');
          }}
          onSaveOperatingHours={async (values) => {
            await updateOperatingHoursMutation.mutateAsync(values);
            showToast({
              title: 'Operating hours updated',
              message: 'Your weekly storefront schedule is now live.'
            });
          }}
          isUpdating={updateStatusMutation.isPending}
          isSaving={updateOperatingHoursMutation.isPending}
          errorMessage={
            updateOperatingHoursMutation.isError ? getAdminApiErrorMessage(updateOperatingHoursMutation.error) : undefined
          }
        />
        <ServiceTypeManager
          settings={settingsQuery.data}
          onUpdateServiceType={async (serviceTypeId, payload) => {
            await updateServiceTypeMutation.mutateAsync({ serviceTypeId, payload });
            showToast({
              title: 'Service menu updated',
              message: `${payload.name} is now updated in the menu.`
            });
          }}
          isUpdating={updateServiceTypeMutation.isPending}
          errorMessage={
            updateServiceTypeMutation.isError ? getAdminApiErrorMessage(updateServiceTypeMutation.error) : undefined
          }
        />
        <AdminAccessManager
          settings={settingsQuery.data}
          onCreateAdmin={async (values) => {
            await createAdminMutation.mutateAsync(values);
            showToast({
              title: 'Admin account created',
              message: `${values.displayName} can now sign in to manage the shop.`
            });
          }}
          onUpdateAdmin={async (adminUserId, values) => {
            await updateAdminMutation.mutateAsync({ adminUserId, payload: values });
            showToast({
              title: 'Admin updated',
              message: `${values.displayName} has been updated successfully.`
            });
          }}
          onToggleAdminStatus={async (adminUserId, isActive) => {
            await updateAdminStatusMutation.mutateAsync({ adminUserId, isActive });
          }}
          onDeleteAdmin={async (adminUserId) => {
            const adminToDelete = settingsQuery.data.admins.find((admin) => admin.id === adminUserId);
            await deleteAdminMutation.mutateAsync(adminUserId);
            showToast({
              title: 'Admin removed',
              message: adminToDelete
                ? `${adminToDelete.displayName} has been removed from admin access.`
                : 'The admin account has been removed.'
            });
          }}
          currentAdminId={session.admin.id}
          isCreating={createAdminMutation.isPending}
          isEditingAdmin={updateAdminMutation.isPending}
          isUpdatingAdmin={updateAdminStatusMutation.isPending}
          isDeletingAdmin={deleteAdminMutation.isPending}
          errorMessage={createAdminMutation.isError ? getAdminApiErrorMessage(createAdminMutation.error) : undefined}
          editErrorMessage={updateAdminMutation.isError ? getAdminApiErrorMessage(updateAdminMutation.error) : undefined}
        />
      </div>
    );

  return (
    <AuthGuard>
      <AdminLayout
        title="Settings"
        description="Review the current storefront state, service menu, operating hours, and roster from one page."
        connectionState={connectionState}
      >
        {content}
      </AdminLayout>
    </AuthGuard>
  );
}
