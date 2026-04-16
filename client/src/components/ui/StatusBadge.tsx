type StatusBadgeProps = {
  label: string;
  tone?: 'success' | 'warning' | 'danger' | 'info';
};

export function StatusBadge({ label, tone = 'info' }: StatusBadgeProps) {
  const tones = {
    success: 'bg-success-100 text-success-600',
    warning: 'bg-warning-100 text-warning-500',
    danger: 'bg-danger-100 text-danger-600',
    info: 'bg-brand-100 text-brand-600'
  };

  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]}`}>{label}</span>;
}
