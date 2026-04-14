import { useEffect } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { AdminShell, ToastViewport } from './components/AdminUI';
import { AppProvider, useApp } from './context/AppContext';
import AnalyticsPage from './pages/AnalyticsPage';
import BarberManagementPage from './pages/BarberManagementPage';
import BookingManagementPage from './pages/BookingManagementPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import QueueManagementPage from './pages/QueueManagementPage';
import SettingsPage from './pages/SettingsPage';

function AuthRedirect() {
  const { isAuthenticated } = useApp();
  return <Navigate replace to={isAuthenticated ? '/dashboard' : '/login'} />;
}

function ScrollManager() {
  const location = useLocation();

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  }, [location.pathname]);

  return null;
}

function RouteTransition({ children }) {
  const location = useLocation();

  return (
    <div className="page-transition" key={location.pathname}>
      {children}
    </div>
  );
}

function ProtectedLayout() {
  const { isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <Navigate replace to="/login" />;
  }

  return (
    <AdminShell>
      <RouteTransition>
        <Outlet />
      </RouteTransition>
    </AdminShell>
  );
}

function LoginRoute() {
  const { isAuthenticated } = useApp();

  if (isAuthenticated) {
    return <Navigate replace to="/dashboard" />;
  }

  return (
    <RouteTransition>
      <LoginPage />
    </RouteTransition>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <ScrollManager />
        <Routes>
          <Route element={<AuthRedirect />} path="/" />
          <Route element={<LoginRoute />} path="/login" />
          <Route element={<ProtectedLayout />}>
            <Route element={<DashboardPage />} path="/dashboard" />
            <Route element={<QueueManagementPage />} path="/queue" />
            <Route element={<BarberManagementPage />} path="/barbers" />
            <Route element={<BookingManagementPage />} path="/bookings" />
            <Route element={<AnalyticsPage />} path="/analytics" />
            <Route element={<SettingsPage />} path="/settings" />
          </Route>
          <Route element={<Navigate replace to="/" />} path="*" />
        </Routes>
        <ToastViewport />
      </BrowserRouter>
    </AppProvider>
  );
}
