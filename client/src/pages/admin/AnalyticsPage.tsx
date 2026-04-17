import { useState } from 'react';

import { AuthGuard } from '../../components/admin/Auth';
import {
  DateRangePicker,
  PeakHoursHeatmap,
  ServicePopularity,
  TrafficChart,
  WaitTimeDistribution
} from '../../components/admin/AnalyticsWidgets';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { ErrorStateCard, QueueLoadingCard } from '../../components/public/QueueComponents';
import { useAdminAuth } from '../../features/admin/auth-context';
import { getAdminApiErrorMessage, useAnalyticsData } from '../../features/admin/hooks';
import { useRealtimeShopSync } from '../../features/realtime/hooks';
import type { AdminAnalyticsRange } from '../../features/admin/types';

export function AnalyticsPage() {
  const { session } = useAdminAuth();
  const [range, setRange] = useState<AdminAnalyticsRange>('last14days');
  const { connectionState } = useRealtimeShopSync({
    shopId: session?.shop.id,
    audience: 'admin'
  });
  const analyticsQuery = useAnalyticsData(session?.shop.id, session?.token, range);

  if (!session) {
    return null;
  }

  const content =
    analyticsQuery.isLoading || !analyticsQuery.data ? (
      <QueueLoadingCard label="Analytics" />
    ) : analyticsQuery.isError ? (
      <ErrorStateCard
        title="Analytics are unavailable right now."
        message={getAdminApiErrorMessage(analyticsQuery.error)}
        onRetry={() => {
          void analyticsQuery.refetch();
        }}
      />
    ) : (
      <>
        <DateRangePicker value={range} onChange={setRange} />
        <div className="grid gap-4 xl:grid-cols-[1.15fr,0.85fr]">
          <TrafficChart data={analyticsQuery.data.hourlyTraffic} />
          <WaitTimeDistribution averageWaitMin={analyticsQuery.data.averageWaitMin} />
        </div>
        <div className="grid gap-4 xl:grid-cols-[1fr,1fr]">
          <PeakHoursHeatmap data={analyticsQuery.data.hourlyTraffic} />
          <ServicePopularity data={analyticsQuery.data.servicePopularity} />
        </div>
      </>
    );

  return (
    <AuthGuard>
      <AdminLayout
        title="Analytics and trends"
        description="See how traffic clusters by hour, which services dominate demand, and how the current wait profile is behaving."
        connectionState={connectionState}
      >
        {content}
      </AdminLayout>
    </AuthGuard>
  );
}
