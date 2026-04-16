import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { PublicLayout } from '../../components/layout/PublicLayout';
import { ErrorStateCard, QueueList, QueueLoadingCard } from '../../components/public/QueueComponents';
import {
  BusyLevelBar,
  HistoricalInsightCard,
  NowServingCard,
  QueuePositionIndicator,
  WaitTimeCard
} from '../../components/public/StatusWidgets';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { formatOperatingHour } from '../../features/public/formatters';
import { getApiErrorMessage, usePublicAnalytics, usePublicShop, useQueueStatus } from '../../features/public/hooks';

export function QueueStatusPage() {
  const shopQuery = usePublicShop();
  const queueQuery = useQueueStatus(shopQuery.data?.id);
  const analyticsQuery = usePublicAnalytics(shopQuery.data?.id);
  const lastUpdated = queueQuery.dataUpdatedAt ? new Date(queueQuery.dataUpdatedAt) : undefined;

  const bestTimeLabel =
    analyticsQuery.data?.bestTimesToVisit[0]?.hour != null
      ? `${analyticsQuery.data.bestTimesToVisit[0].hour}:00 - ${String(
          Number(analyticsQuery.data.bestTimesToVisit[0].hour) + 1
        ).padStart(2, '0')}:00`
      : 'Mid-afternoon tends to be calmer';

  if (shopQuery.isLoading || queueQuery.isLoading) {
    return (
      <PublicLayout lastUpdated={lastUpdated}>
        <div className="grid gap-4 sm:grid-cols-2">
          <QueueLoadingCard label="Live queue" />
          <QueueLoadingCard label="Queue pulse" />
        </div>
        <QueueLoadingCard label="People waiting right now" />
      </PublicLayout>
    );
  }

  if (shopQuery.isError || queueQuery.isError || !shopQuery.data || !queueQuery.data) {
    return (
      <PublicLayout lastUpdated={lastUpdated}>
        <ErrorStateCard
          title="We couldn't load the public queue yet."
          message={getApiErrorMessage(shopQuery.error ?? queueQuery.error)}
          onRetry={() => {
            void shopQuery.refetch();
            void queueQuery.refetch();
          }}
        />
      </PublicLayout>
    );
  }

  const shop = shopQuery.data;
  const queueStatus = queueQuery.data;

  return (
    <PublicLayout
      shop={shop}
      lastUpdated={lastUpdated}
      actions={
        <Link
          to="/queue/join"
          className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-brand-700"
        >
          Join queue
          <ArrowRight size={16} />
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <WaitTimeCard
          waitMinutes={queueStatus.estimatedWait}
          queueLength={queueStatus.currentQueue}
          isOpen={queueStatus.isOpen}
        />
        <QueuePositionIndicator
          queueLength={queueStatus.currentQueue}
          queueLabel={
            queueStatus.currentQueue === 1 ? 'person waiting at the moment' : 'people waiting at the moment'
          }
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr,0.9fr]">
        <div className="grid gap-4">
          <BusyLevelBar busyLevel={queueStatus.busyLevel} queueLength={queueStatus.currentQueue} />
          <NowServingCard nowServing={queueStatus.nowServing} shop={shop} />
          <QueueList
            entries={queueStatus.queue}
            title={queueStatus.currentQueue === 0 ? 'Queue is clear' : 'People waiting right now'}
          />
        </div>

        <div className="grid gap-4">
          <HistoricalInsightCard
            averageWaitMinutes={analyticsQuery.data?.averageWaitMinutes ?? queueStatus.estimatedWait}
            bestTimeLabel={bestTimeLabel}
          />
          <Card className="space-y-4">
            <p className="section-label">Opening hours</p>
            <div className="grid gap-2 text-sm text-muted">
              {shop.operatingHours.map((item) => (
                <div key={item.id}>{formatOperatingHour(item.dayOfWeek, item.opensAt, item.closesAt, item.isEnabled)}</div>
              ))}
            </div>
          </Card>
          <Card className="space-y-3">
            <p className="section-label">Need a quick choice?</p>
            <p className="text-sm text-muted">
              If the wait looks right, jump into the queue. If not, use the historical view to time your visit
              a bit better.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/queue/join" className="flex-1">
                <Button className="w-full">Join the queue</Button>
              </Link>
              <Link to="/queue/history" className="flex-1">
                <Button variant="secondary" className="w-full">
                  Explore best times
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}
