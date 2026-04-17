import type { PropsWithChildren, ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { AdminAuthProvider } from '../features/admin/auth-context';
import { ToastProvider } from '../features/feedback/toast-provider';

type ProvidersOptions = {
  route?: string;
};

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      },
      mutations: {
        retry: false
      }
    }
  });
}

export function renderWithProviders(
  ui: ReactElement,
  { route = '/' }: ProvidersOptions = {},
  renderOptions?: Omit<RenderOptions, 'wrapper'>
) {
  const queryClient = createTestQueryClient();

  function Wrapper({ children }: PropsWithChildren) {
    return (
      <MemoryRouter initialEntries={[route]}>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <AdminAuthProvider>{children}</AdminAuthProvider>
          </ToastProvider>
        </QueryClientProvider>
      </MemoryRouter>
    );
  }

  return {
    queryClient,
    ...render(ui, { wrapper: Wrapper, ...renderOptions })
  };
}
