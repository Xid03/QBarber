import { BarChart3, Clock3, DollarSign, UsersRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { AuthGuard } from '../../components/admin/Auth';
import {
  getShowcaseStatValue,
  ShowcaseLiveQueue,
  ShowcaseQuickActions,
  ShowcaseRecentActivity,
  ShowcaseStatCard,
  ShowcaseTrafficCard
} from '../../components/admin/DashboardShowcase';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { ErrorStateCard, QueueLoadingCard } from '../../components/public/QueueComponents';
import { useAdminAuth } from '../../features/admin/auth-context';
import { getAdminApiErrorMessage, useAdminDashboard, useAnalyticsData, useSettings } from '../../features/admin/hooks';
import { useRealtimeShopSync } from '../../features/realtime/hooks';

export function DashboardPage() {
  const { session } = useAdminAuth();
  const navigate = useNavigate();
  const { connectionState } = useRealtimeShopSync({
    shopId: session?.shop.id,
    audience: 'admin'
  });
  const dashboardQuery = useAdminDashboard(session?.shop.id, session?.token);
  const analyticsQuery = useAnalyticsData(session?.shop.id, session?.token);
  const { settingsQuery, updateStatusMutation } = useSettings(session?.shop.id, session?.token);

  if (!session) {
    return null;
  }

  const content =
    dashboardQuery.isLoading || settingsQuery.isLoading || analyticsQuery.isLoading || !dashboardQuery.data || !settingsQuery.data ? (
    <div className="grid gap-4">
      <QueueLoadingCard label="Dashboard" />
    </div>
  ) : dashboardQuery.isError || settingsQuery.isError || analyticsQuery.isError ? (
    <ErrorStateCard
      title="Dashboard data could not be loaded."
      message={getAdminApiErrorMessage(dashboardQuery.error ?? settingsQuery.error ?? analyticsQuery.error)}
      onRetry={() => {
        void dashboardQuery.refetch();
        void settingsQuery.refetch();
        void analyticsQuery.refetch();
      }}
    />
  ) : (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ShowcaseStatCard
          title="Served Today"
          icon={<UsersRound size={18} className="text-emerald-600" />}
          accentClass="bg-emerald-100"
          {...getShowcaseStatValue('Served Today', dashboardQuery.data)}
        />
        <ShowcaseStatCard
          title="Avg Wait Time"
          icon={<Clock3 size={18} className="text-blue-600" />}
          accentClass="bg-blue-100"
          {...getShowcaseStatValue('Avg Wait Time', dashboardQuery.data)}
        />
        <ShowcaseStatCard
          title="In Queue"
          icon={<BarChart3 size={18} className="text-orange-500" />}
          accentClass="bg-orange-100"
          {...getShowcaseStatValue('In Queue', dashboardQuery.data)}
        />
        <ShowcaseStatCard
          title="Est. Revenue"
          icon={<DollarSign size={18} className="text-violet-600" />}
          accentClass="bg-violet-100"
          {...getShowcaseStatValue('Est. Revenue', dashboardQuery.data)}
        />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.65fr,0.9fr]">
        <ShowcaseLiveQueue
          points={dashboardQuery.data.liveQueue}
          onViewAll={() => navigate('/admin/queue')}
          onManualAdd={() => navigate('/admin/queue')}
        />
        <div className="grid gap-5">
          <ShowcaseTrafficCard analytics={analyticsQuery.data} busyLevel={dashboardQuery.data.busyLevel} />
          <ShowcaseQuickActions
            isShopOpen={settingsQuery.data.status === 'OPEN'}
            onManualAdd={() => navigate('/admin/queue')}
            onOpenQueue={() => navigate('/admin/queue')}
            onOpenAnalytics={() => navigate('/admin/analytics')}
            onOpenSettings={() => navigate('/admin/settings')}
            onToggleStatus={() => {
              updateStatusMutation.mutate(settingsQuery.data.status !== 'OPEN');
            }}
            isUpdatingStatus={updateStatusMutation.isPending}
          />
          <ShowcaseRecentActivity data={dashboardQuery.data} analytics={analyticsQuery.data} />
        </div>
      </div>
    </>
  );

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';
  const displayDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date());

  return (
    <AuthGuard>
      <AdminLayout
        title={`${greeting}, ${session.admin.displayName}!`}
        description={displayDate}
        connectionState={connectionState}
      >
        {content}
      </AdminLayout>
    </AuthGuard>
  );
}
