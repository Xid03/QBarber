import { createBrowserRouter } from 'react-router-dom';

import { AdminLoginPage } from '../pages/admin/AdminLoginPage';
import { AnalyticsPage } from '../pages/admin/AnalyticsPage';
import { DashboardPage } from '../pages/admin/DashboardPage';
import { QueueManagementPage } from '../pages/admin/QueueManagementPage';
import { SettingsPage } from '../pages/admin/SettingsPage';
import { HistoricalWaitTimesPage } from '../pages/public/HistoricalWaitTimesPage';
import { JoinQueuePage } from '../pages/public/JoinQueuePage';
import { MyPositionPage } from '../pages/public/MyPositionPage';
import { QueueStatusPage } from '../pages/public/QueueStatusPage';

export const router = createBrowserRouter([
  { path: '/', element: <QueueStatusPage /> },
  { path: '/queue', element: <QueueStatusPage /> },
  { path: '/queue/join', element: <JoinQueuePage /> },
  { path: '/my-position/:entryId', element: <MyPositionPage /> },
  { path: '/queue/history', element: <HistoricalWaitTimesPage /> },
  { path: '/admin/login', element: <AdminLoginPage /> },
  { path: '/admin/dashboard', element: <DashboardPage /> },
  { path: '/admin/queue', element: <QueueManagementPage /> },
  { path: '/admin/analytics', element: <AnalyticsPage /> },
  { path: '/admin/settings', element: <SettingsPage /> }
]);
