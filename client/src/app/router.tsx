import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter } from 'react-router-dom';

import { RouteLoadingScreen } from '../components/ui/RouteLoadingScreen';

const QueueStatusPage = lazy(async () =>
  import('../pages/public/QueueStatusPage').then((module) => ({ default: module.QueueStatusPage }))
);
const JoinQueuePage = lazy(async () =>
  import('../pages/public/JoinQueuePage').then((module) => ({ default: module.JoinQueuePage }))
);
const MyPositionPage = lazy(async () =>
  import('../pages/public/MyPositionPage').then((module) => ({ default: module.MyPositionPage }))
);
const HistoricalWaitTimesPage = lazy(async () =>
  import('../pages/public/HistoricalWaitTimesPage').then((module) => ({
    default: module.HistoricalWaitTimesPage
  }))
);
const AdminLoginPage = lazy(async () =>
  import('../pages/admin/AdminLoginPage').then((module) => ({ default: module.AdminLoginPage }))
);
const DashboardPage = lazy(async () =>
  import('../pages/admin/DashboardPage').then((module) => ({ default: module.DashboardPage }))
);
const QueueManagementPage = lazy(async () =>
  import('../pages/admin/QueueManagementPage').then((module) => ({
    default: module.QueueManagementPage
  }))
);
const AnalyticsPage = lazy(async () =>
  import('../pages/admin/AnalyticsPage').then((module) => ({ default: module.AnalyticsPage }))
);
const SettingsPage = lazy(async () =>
  import('../pages/admin/SettingsPage').then((module) => ({ default: module.SettingsPage }))
);

function withSuspense(element: ReactNode) {
  return <Suspense fallback={<RouteLoadingScreen />}>{element}</Suspense>;
}

export const router = createBrowserRouter([
  { path: '/', element: withSuspense(<QueueStatusPage />) },
  { path: '/queue', element: withSuspense(<QueueStatusPage />) },
  { path: '/queue/join', element: withSuspense(<JoinQueuePage />) },
  { path: '/my-position/:entryId', element: withSuspense(<MyPositionPage />) },
  { path: '/queue/history', element: withSuspense(<HistoricalWaitTimesPage />) },
  { path: '/admin/login', element: withSuspense(<AdminLoginPage />) },
  { path: '/admin/dashboard', element: withSuspense(<DashboardPage />) },
  { path: '/admin/queue', element: withSuspense(<QueueManagementPage />) },
  { path: '/admin/analytics', element: withSuspense(<AnalyticsPage />) },
  { path: '/admin/settings', element: withSuspense(<SettingsPage />) }
]);
