import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'ghost';
  }
>;

export function Button({ children, className = '', variant = 'primary', ...props }: ButtonProps) {
  const variants = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700',
    secondary: 'border border-slate-200 bg-white text-slate-950 hover:bg-slate-50',
    ghost: 'bg-transparent text-brand-600 hover:bg-brand-100'
  };

  return (
    <button
      className={`rounded-md px-4 py-3 text-sm font-semibold transition ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
