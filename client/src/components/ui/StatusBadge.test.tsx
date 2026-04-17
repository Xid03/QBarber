import { render, screen } from '@testing-library/react';

import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('renders the provided label', () => {
    render(<StatusBadge label="Open now" />);

    expect(screen.getByText('Open now')).toBeInTheDocument();
  });

  it('uses the success tone styles when requested', () => {
    render(<StatusBadge label="Completed" tone="success" />);

    const badge = screen.getByText('Completed').closest('span');
    expect(badge?.className).toContain('bg-success-100');
    expect(badge?.className).toContain('text-success-600');
  });

  it('keeps custom classes alongside the built-in styling', () => {
    render(<StatusBadge label="Serving" className="extra-chip" />);

    const badge = screen.getByText('Serving').closest('span');
    expect(badge).toHaveClass('extra-chip');
    expect(badge?.className).toContain('bg-brand-100');
  });
});
