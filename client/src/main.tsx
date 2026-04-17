import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';

import './index.css';
import { queryClient } from './lib/query-client';
import { router } from './app/router';
import { AdminAuthProvider } from './features/admin/auth-context';
import { ToastProvider } from './features/feedback/toast-provider';
import { SocketProvider } from './features/realtime/socket-provider';
import { ThemeProvider } from './features/theme/theme-provider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SocketProvider>
          <ToastProvider>
            <AdminAuthProvider>
              <RouterProvider router={router} />
            </AdminAuthProvider>
          </ToastProvider>
        </SocketProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
