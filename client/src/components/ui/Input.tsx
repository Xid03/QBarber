import type { InputHTMLAttributes } from 'react';

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="w-full rounded-md border border-slate-200 px-4 py-3 text-sm" {...props} />;
}
