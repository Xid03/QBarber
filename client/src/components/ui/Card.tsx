import type { PropsWithChildren } from 'react';

export function Card({ children }: PropsWithChildren) {
  return <div className="rounded-lg bg-white p-5 shadow-soft">{children}</div>;
}
