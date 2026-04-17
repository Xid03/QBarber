import { useState } from 'react';

import { AuthGuard } from '../../components/admin/Auth';
import { AddCustomerForm, AdminQueueTable, CustomerDetailModal } from '../../components/admin/QueueManagement';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { ErrorStateCard, QueueLoadingCard } from '../../components/public/QueueComponents';
import { useAdminAuth } from '../../features/admin/auth-context';
import { useToast } from '../../features/feedback/toast-provider';
import { getAdminApiErrorMessage, useAdminQueue, useQueueActions, useSettings } from '../../features/admin/hooks';
import { useRealtimeShopSync } from '../../features/realtime/hooks';

export function QueueManagementPage() {
  const { session } = useAdminAuth();
  const { showToast } = useToast();
  const [selectedEntryId, setSelectedEntryId] = useState<string | undefined>();
  const { connectionState } = useRealtimeShopSync({
    shopId: session?.shop.id,
    audience: 'admin'
  });
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
              const entry = queueQuery.data.queue.find((item) => item.entryId === entryId);
              setSelectedEntryId(entryId);
              startMutation.mutate(entryId, {
                onSuccess: () => {
                  showToast({
                    title: 'Service started',
                    message: entry ? `${entry.customerName} is now in the chair.` : 'The selected service is now in progress.'
                  });
                }
              });
            }}
            onComplete={(entryId) => {
              const entry = queueQuery.data.queue.find((item) => item.entryId === entryId);
              setSelectedEntryId(entryId);
              completeMutation.mutate(entryId, {
                onSuccess: () => {
                  showToast({
                    title: 'Service completed',
                    message: entry
                      ? `${entry.customerName} has been checked out of the queue.`
                      : 'The selected service has been completed.'
                  });
                }
              });
            }}
            onCancel={(entryId) => {
              const entry = queueQuery.data.queue.find((item) => item.entryId === entryId);
              setSelectedEntryId(entryId);
              cancelMutation.mutate(entryId, {
                onSuccess: () => {
                  showToast({
                    title: 'Queue item cancelled',
                    message: entry
                      ? `${entry.customerName} was removed from the queue.`
                      : 'The selected queue item was cancelled.'
                  });
                }
              });
            }}
            isMutating={isMutating}
          />
        </div>
        <div className="grid gap-4">
          <AddCustomerForm
            shop={settingsQuery.data}
            onSubmit={async (values) => {
              await manualAddMutation.mutateAsync(values);
              showToast({
                title: 'Added to queue',
                message: `${values.customerName} has been added as a walk-in customer.`
              });
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
        connectionState={connectionState}
      >
        {content}
      </AdminLayout>
    </AuthGuard>
  );
}
