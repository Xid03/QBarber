export function RouteLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="glass-panel page-shell w-full max-w-md rounded-[28px] p-8 text-center shadow-soft">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600/10">
          <div className="h-7 w-7 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin motion-safe:animate-spin motion-reduce:animate-none" />
        </div>
        <p className="mt-5 text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">Loading page</p>
        <h2 className="mt-3 text-2xl font-semibold text-slate-950">Getting QFlow ready</h2>
        <p className="mt-2 text-sm text-muted">
          Pulling in the next screen so the transition stays smooth and the queue details stay fresh.
        </p>
      </div>
    </div>
  );
}
