import type { PropsWithChildren } from 'react';

type CardProps = PropsWithChildren<{
  className?: string;
}>;

export function Card({ children, className = '' }: CardProps) {
  return <div className={`glass-panel rounded-lg p-5 shadow-soft ${className}`}>{children}</div>;
}
