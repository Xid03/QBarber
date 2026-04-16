import { PublicLayout } from '../../components/layout/PublicLayout';
import { ErrorStateCard, QueueLoadingCard } from '../../components/public/QueueComponents';
import { Card } from '../../components/ui/Card';
import { formatMinutes } from '../../features/public/formatters';
import { getApiErrorMessage, usePublicAnalytics, usePublicShop } from '../../features/public/hooks';

export function HistoricalWaitTimesPage() {
  const shopQuery = usePublicShop();
  const analyticsQuery = usePublicAnalytics(shopQuery.data?.id);

  if (shopQuery.isError || analyticsQuery.isError) {
    return (
      <PublicLayout shop={shopQuery.data}>
        <ErrorStateCard
          title="Historical queue trends aren't ready yet."
          message={getApiErrorMessage(shopQuery.error ?? analyticsQuery.error)}
          onRetry={() => {
            void shopQuery.refetch();
            void analyticsQuery.refetch();
          }}
        />
      </PublicLayout>
    );
  }

  if (shopQuery.isLoading || analyticsQuery.isLoading || !shopQuery.data || !analyticsQuery.data) {
    return (
      <PublicLayout shop={shopQuery.data}>
        <QueueLoadingCard label="Historical wait times" />
      </PublicLayout>
    );
  }

  const shop = shopQuery.data;
  const analytics = analyticsQuery.data;
  const trafficScale = Math.max(...analytics.peakHours.map((item) => item.count), 1);

  return (
    <PublicLayout shop={shop} lastUpdated={new Date(analyticsQuery.dataUpdatedAt)}>
      <div className="grid gap-4 lg:grid-cols-[1.15fr,0.85fr]">
        <Card className="space-y-5">
          <div>
            <p className="section-label">Historical wait snapshot</p>
            <h2 className="mt-2 text-2xl font-semibold">Recent traffic windows for smarter walk-ins.</h2>
          </div>
          <div className="space-y-4">
            {analytics.peakHours.map((item) => (
              <div key={item.hour} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-900">{item.hour}:00</span>
                  <span className="text-muted">{item.count} visits</span>
                </div>
                <div className="h-3 rounded-full bg-slate-200">
                  <div
                    className="h-3 rounded-full bg-brand-600"
                    style={{ width: `${(item.count / trafficScale) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid gap-4">
          <Card className="space-y-3">
            <p className="section-label">Average wait</p>
            <p className="text-4xl font-bold tracking-tight">{formatMinutes(analytics.averageWaitMinutes)}</p>
            <p className="text-sm text-muted">
              This view uses recent queue behavior to hint at better windows rather than promising an exact
              outcome.
            </p>
          </Card>

          <Card className="space-y-4">
            <p className="section-label">Best times to visit</p>
            <div className="grid gap-3">
              {analytics.bestTimesToVisit.map((item) => (
                <div key={item.hour} className="rounded-2xl bg-success-100 px-4 py-4">
                  <p className="text-sm font-semibold text-success-600">{item.hour}:00 to {String(Number(item.hour) + 1).padStart(2, '0')}:00</p>
                  <p className="mt-1 text-sm text-slate-700">{item.count} recent visits in this slot.</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}
