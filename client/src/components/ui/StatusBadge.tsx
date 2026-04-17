type StatusBadgeProps = {
  label: string;
  tone?: 'success' | 'warning' | 'danger' | 'info';
  className?: string;
};

export function StatusBadge({ label, tone = 'info', className = '' }: StatusBadgeProps) {
  const tones = {
    success: 'bg-success-100 text-success-600',
    warning: 'bg-warning-100 text-warning-500',
    danger: 'bg-danger-100 text-danger-600',
    info: 'bg-brand-100 text-brand-600'
  };

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]} ${className}`}>
      <span
        className={`h-2 w-2 rounded-full ${tone === 'info' ? 'live-dot bg-brand-500' : tone === 'success' ? 'bg-success-500' : tone === 'warning' ? 'bg-warning-500' : 'bg-danger-500'}`}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
