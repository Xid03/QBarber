import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import type { ShopMetadata } from '../../features/public/types';
import { renderWithProviders } from '../../test/utils';
import { JoinQueueForm } from './Forms';

const shop: ShopMetadata = {
  id: 'shop-1',
  name: 'YZH Barber',
  slug: 'yzh-barber',
  status: 'OPEN',
  timezone: 'Asia/Kuala_Lumpur',
  phone: '+60 12-123 4567',
  address: '123 Main Street',
  isOpen: true,
  serviceTypes: [
    { id: 'svc-haircut', name: 'Haircut', durationMinutes: 30, priceCents: 3500, isActive: true },
    { id: 'svc-beard', name: 'Beard Trim', durationMinutes: 15, priceCents: 1500, isActive: true }
  ],
  barbers: [],
  operatingHours: []
};

describe('JoinQueueForm', () => {
  it('blocks submit until a customer name is provided', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    renderWithProviders(<JoinQueueForm shop={shop} onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: /join queue now/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Please enter your name.')).toBeInTheDocument();
  });

  it('accepts an empty optional phone number', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    renderWithProviders(<JoinQueueForm shop={shop} onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText(/name the barber can call out/i), 'Amin');
    await user.click(screen.getByRole('button', { name: /join queue now/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        customerName: 'Amin',
        customerPhone: undefined,
        serviceTypeId: 'svc-haircut'
      });
    });
  });

  it('submits the selected service type after the customer changes cards', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    renderWithProviders(<JoinQueueForm shop={shop} onSubmit={onSubmit} />);

    const beardTrimButton = screen.getByRole('button', { name: /beard trim/i });

    await user.click(beardTrimButton);
    await user.type(screen.getByPlaceholderText(/name the barber can call out/i), 'Farah');
    await user.click(screen.getByRole('button', { name: /join queue now/i }));

    expect(beardTrimButton).toHaveAttribute('aria-pressed', 'true');

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        customerName: 'Farah',
        customerPhone: undefined,
        serviceTypeId: 'svc-beard'
      });
    });
  });

  it('renders the backend error message when the join request fails', () => {
    renderWithProviders(
      <JoinQueueForm shop={shop} onSubmit={vi.fn()} errorMessage="Shop is temporarily paused." />
    );

    expect(screen.getByText('Shop is temporarily paused.')).toBeInTheDocument();
  });
});
