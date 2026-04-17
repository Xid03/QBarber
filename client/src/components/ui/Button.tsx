import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  }
>;

export function Button({ children, className = '', variant = 'primary', ...props }: ButtonProps) {
  const variants = {
    primary:
      'bg-brand-600 text-white shadow-soft hover:-translate-y-0.5 hover:bg-brand-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40',
    secondary:
      'glass-panel border border-white/70 bg-white/80 text-slate-950 hover:-translate-y-0.5 hover:bg-white active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/25',
    ghost:
      'bg-transparent text-brand-700 hover:bg-brand-100/70 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/25',
    danger:
      'bg-danger-500 text-white shadow-soft hover:-translate-y-0.5 hover:bg-danger-600 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger-500/35'
  };

  return (
    <button
      className={`rounded-md px-4 py-3 text-sm font-semibold transition duration-200 motion-reduce:transform-none disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
