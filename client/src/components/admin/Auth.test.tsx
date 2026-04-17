import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { renderWithProviders } from '../../test/utils';
import { LoginForm } from './Auth';

const { loginAdminMock } = vi.hoisted(() => ({
  loginAdminMock: vi.fn()
}));

vi.mock('../../features/admin/hooks', () => ({
  loginAdmin: loginAdminMock,
  getAdminApiErrorMessage: (error: unknown) =>
    error instanceof Error ? error.message : 'Unable to sign in.'
}));

describe('LoginForm', () => {
  it('toggles password visibility from the eye button', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />, { route: '/admin/login' });

    const passwordField = screen.getByPlaceholderText(/enter your password/i);
    expect(passwordField).toHaveAttribute('type', 'password');

    await user.click(screen.getByRole('button', { name: /show password/i }));
    expect(passwordField).toHaveAttribute('type', 'text');
  });

  it('submits the entered credentials and persists the new session', async () => {
    const user = userEvent.setup();

    loginAdminMock.mockResolvedValueOnce({
      token: 'token-123',
      admin: {
        id: 'admin-1',
        username: 'owner',
        displayName: 'Owner',
        role: 'ADMIN'
      },
      shop: {
        id: 'shop-1',
        name: 'YZH Barber'
      }
    });

    renderWithProviders(<LoginForm />, { route: '/admin/login' });

    await user.type(screen.getByPlaceholderText('admin'), 'owner');
    await user.type(screen.getByPlaceholderText(/enter your password/i), 'secret123');
    await user.click(screen.getByRole('button', { name: /open admin dashboard/i }));

    await waitFor(() => {
      expect(loginAdminMock).toHaveBeenCalledWith({
        username: 'owner',
        password: 'secret123'
      });
    });

    await waitFor(() => {
      expect(window.localStorage.getItem('qflow-admin-session')).toContain('"username":"owner"');
    });

    expect(screen.getByText('Signed in successfully')).toBeInTheDocument();
  });

  it('shows a friendly error when sign in fails', async () => {
    const user = userEvent.setup();

    loginAdminMock.mockRejectedValueOnce(new Error('Invalid username or password.'));

    renderWithProviders(<LoginForm />, { route: '/admin/login' });

    await user.type(screen.getByPlaceholderText('admin'), 'owner');
    await user.type(screen.getByPlaceholderText(/enter your password/i), 'wrongpass');
    await user.click(screen.getByRole('button', { name: /open admin dashboard/i }));

    expect(await screen.findByText('Invalid username or password.')).toBeInTheDocument();
  });
});
