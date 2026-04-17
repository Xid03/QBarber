import type { HTMLAttributes, PropsWithChildren } from 'react';

type CardProps = PropsWithChildren<
  HTMLAttributes<HTMLDivElement> & {
  className?: string;
}
>;

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div className={`glass-panel page-section rounded-lg p-5 shadow-soft ${className}`} {...props}>
      {children}
    </div>
  );
}
