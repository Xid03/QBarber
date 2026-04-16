import { useState } from 'react';

import { AuthGuard } from '../../components/admin/Auth';
import { AddCustomerForm, AdminQueueTable, CustomerDetailModal } from '../../components/admin/QueueManagement';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { ErrorStateCard, QueueLoadingCard } from '../../components/public/QueueComponents';
import { useAdminAuth } from '../../features/admin/auth-context';
import { getAdminApiErrorMessage, useAdminQueue, useQueueActions, useSettings } from '../../features/admin/hooks';

export function QueueManagementPage() {
  const { session } = useAdminAuth();
  const [selectedEntryId, setSelectedEntryId] = useState<string | undefined>();
  const queueQuery = useAdminQueue(session?.shop.id);
  const { settingsQuery } = useSettings(session?.shop.id, session?.token);
  const { startMutation, completeMutation, cancelMutation, manualAddMutation } = useQueueActions(
    session?.shop.id,
    session?.token
  );

  if (!session) {
    return null;
  }

  const selectedEntry = queueQuery.data?.queue.find((entry) => entry.entryId === selectedEntryId);
  const isMutating =
    startMutation.isPending || completeMutation.isPending || cancelMutation.isPending || manualAddMutation.isPending;

  const content =
    queueQuery.isLoading || settingsQuery.isLoading || !queueQuery.data || !settingsQuery.data ? (
      <QueueLoadingCard label="Queue management" />
    ) : queueQuery.isError || settingsQuery.isError ? (
      <ErrorStateCard
        title="Queue management is not ready yet."
        message={getAdminApiErrorMessage(queueQuery.error ?? settingsQuery.error)}
        onRetry={() => {
          void queueQuery.refetch();
          void settingsQuery.refetch();
        }}
      />
    ) : (
      <div className="grid gap-4 xl:grid-cols-[1.35fr,0.95fr]">
        <div className="grid gap-4">
          <AdminQueueTable
            entries={queueQuery.data.queue}
            onSelect={(entryId) => {
              setSelectedEntryId(entryId);
            }}
            onStart={(entryId) => {
              setSelectedEntryId(entryId);
              startMutation.mutate(entryId);
            }}
            onComplete={(entryId) => {
              setSelectedEntryId(entryId);
              completeMutation.mutate(entryId);
            }}
            onCancel={(entryId) => {
              setSelectedEntryId(entryId);
              cancelMutation.mutate(entryId);
            }}
            isMutating={isMutating}
          />
        </div>
        <div className="grid gap-4">
          <AddCustomerForm
            shop={settingsQuery.data}
            onSubmit={(values) => {
              manualAddMutation.mutate(values);
            }}
            isSubmitting={manualAddMutation.isPending}
            errorMessage={manualAddMutation.isError ? getAdminApiErrorMessage(manualAddMutation.error) : undefined}
          />
          <CustomerDetailModal entry={selectedEntry} />
        </div>
      </div>
    );

  return (
    <AuthGuard>
      <AdminLayout
        title="Queue management"
        description="Work the active queue, start services, complete chairs, and add walk-ins from the front desk."
      >
        {content}
      </AdminLayout>
    </AuthGuard>
  );
}
