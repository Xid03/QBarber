import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { PublicLayout } from '../../components/layout/PublicLayout';
import {
  ErrorStateCard,
  LeaveQueueButton,
  PeopleAheadList,
  PositionTracker,
  QueueLoadingCard
} from '../../components/public/QueueComponents';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { getApiErrorMessage, useEntryStatus, useLeaveQueue, usePublicShop } from '../../features/public/hooks';

export function MyPositionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { entryId = '' } = useParams();
  const shopQuery = usePublicShop();
  const entryQuery = useEntryStatus(shopQuery.data?.id, entryId);
  const leaveQueueMutation = useLeaveQueue(shopQuery.data?.id);
  const joinedFromForm = Boolean((location.state as { joined?: boolean } | null)?.joined);

  if (shopQuery.isError || entryQuery.isError) {
    return (
      <PublicLayout shop={shopQuery.data}>
        <ErrorStateCard
          title="We couldn't load your live queue status."
          message={getApiErrorMessage(shopQuery.error ?? entryQuery.error)}
          onRetry={() => {
            void shopQuery.refetch();
            void entryQuery.refetch();
          }}
        />
      </PublicLayout>
    );
  }

  if (shopQuery.isLoading || entryQuery.isLoading || !shopQuery.data || !entryQuery.data) {
    return (
      <PublicLayout shop={shopQuery.data}>
        <QueueLoadingCard label="Your position" />
      </PublicLayout>
    );
  }

  const shop = shopQuery.data;
  const entryStatus = entryQuery.data;

  return (
    <PublicLayout shop={shop} lastUpdated={new Date(entryQuery.dataUpdatedAt)}>
      <div className="grid gap-4 lg:grid-cols-[1.15fr,0.85fr]">
        <div className="grid gap-4">
          {joinedFromForm ? (
            <Card className="border border-success-100 bg-success-100/50">
              <p className="section-label">You're in the queue</p>
              <p className="mt-2 text-lg font-semibold">QFlow saved your place and will keep this tracker fresh.</p>
            </Card>
          ) : null}

          <PositionTracker entry={entryStatus.entry} peopleAheadCount={entryStatus.peopleAhead.length} />
          <PeopleAheadList entries={entryStatus.peopleAhead} />
        </div>

        <div className="grid gap-4">
          <Card className="space-y-3">
            <p className="section-label">Queue guidance</p>
            <p className="text-sm text-muted">
              Leave this page open if you want a quick glance at progress. The tracker refreshes roughly every
              15 seconds.
            </p>
            <p className="text-sm text-muted">
              If your plans change, you can leave the queue here and the positions behind you will tighten up
              automatically.
            </p>
          </Card>

          <Card className="space-y-4">
            <p className="section-label">Actions</p>
            <LeaveQueueButton
              isLoading={leaveQueueMutation.isPending}
              onLeave={() => {
                leaveQueueMutation.mutate(entryStatus.entry.entryId, {
                  onSuccess: () => {
                    navigate('/queue');
                  }
                });
              }}
            />
            <Button variant="ghost" className="w-full sm:w-auto" onClick={() => navigate('/queue/history')}>
              Check calmer visit times
            </Button>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}
