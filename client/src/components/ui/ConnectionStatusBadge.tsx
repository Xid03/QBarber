import type { LiveConnectionState } from '../../features/realtime/socket-provider';

export function ConnectionStatusBadge({ state }: { state: LiveConnectionState }) {
  const config = {
    live: {
      dot: 'bg-emerald-500',
      label: 'Live',
      className: 'bg-emerald-50 text-emerald-700'
    },
    reconnecting: {
      dot: 'bg-amber-500',
      label: 'Reconnecting',
      className: 'bg-amber-50 text-amber-700'
    },
    polling: {
      dot: 'bg-slate-400',
      label: 'Polling',
      className: 'bg-slate-100 text-slate-600'
    }
  } satisfies Record<
    LiveConnectionState,
    {
      dot: string;
      label: string;
      className: string;
    }
  >;

  const current = config[state];

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${current.className}`}>
      <span className={`h-2.5 w-2.5 rounded-full ${current.dot}`} />
      {current.label}
    </span>
  );
}
