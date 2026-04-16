import { useNavigate } from 'react-router-dom';

import { PublicLayout } from '../../components/layout/PublicLayout';
import { ConfirmationModal, JoinQueueForm } from '../../components/public/Forms';
import { ErrorStateCard, QueueLoadingCard } from '../../components/public/QueueComponents';
import { Card } from '../../components/ui/Card';
import { formatOperatingHour } from '../../features/public/formatters';
import { getApiErrorMessage, useJoinQueue, usePublicShop } from '../../features/public/hooks';

export function JoinQueuePage() {
  const navigate = useNavigate();
  const shopQuery = usePublicShop();
  const joinQueueMutation = useJoinQueue(shopQuery.data?.id);

  if (shopQuery.isError) {
    return (
      <PublicLayout>
        <ErrorStateCard
          title="We couldn't load the shop details for joining."
          message={getApiErrorMessage(shopQuery.error)}
          onRetry={() => {
            void shopQuery.refetch();
          }}
        />
      </PublicLayout>
    );
  }

  if (shopQuery.isLoading || !shopQuery.data) {
    return (
      <PublicLayout lastUpdated={undefined}>
        <QueueLoadingCard label="Join queue" />
      </PublicLayout>
    );
  }

  const shop = shopQuery.data;

  return (
    <PublicLayout shop={shop}>
      <div className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="grid gap-4">
          {joinQueueMutation.isSuccess ? (
            <ConfirmationModal
              queueNumber={joinQueueMutation.data.entry.position}
              estimatedWait={joinQueueMutation.data.entry.estimatedWaitMinutes}
            />
          ) : null}

          <JoinQueueForm
            shop={shop}
            isSubmitting={joinQueueMutation.isPending}
            errorMessage={joinQueueMutation.isError ? getApiErrorMessage(joinQueueMutation.error) : undefined}
            onSubmit={(values) => {
              joinQueueMutation.mutate(values, {
                onSuccess: (data) => {
                  navigate(`/my-position/${data.entry.entryId}`, {
                    state: {
                      joined: true
                    }
                  });
                }
              });
            }}
          />
        </div>

        <div className="grid gap-4">
          <Card className="space-y-4">
            <p className="section-label">Before you join</p>
            <ul className="grid gap-3 text-sm text-muted">
              <li>Name is what the barber will call out.</li>
              <li>Phone stays optional for now, but it helps future reminder features.</li>
              <li>Service choice drives the wait estimate you see after joining.</li>
            </ul>
          </Card>

          <Card className="space-y-4">
            <p className="section-label">Opening hours</p>
            <div className="grid gap-2 text-sm text-muted">
              {shop.operatingHours.map((item) => (
                <div key={item.id}>{formatOperatingHour(item.dayOfWeek, item.opensAt, item.closesAt, item.isEnabled)}</div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}
