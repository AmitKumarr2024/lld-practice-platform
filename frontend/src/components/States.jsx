export function Loading({ label = "loading" }) {
  return (
    <div className="flex items-center gap-3 py-16 font-mono text-xs tracking-wide text-muted">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan" />
      </span>
      {label}...
    </div>
  );
}

export function ErrorState({ message }) {
  return (
    <div className="border border-danger/40 bg-danger/5 px-4 py-3 font-mono text-xs text-danger">
      error — {message}
    </div>
  );
}

export function EmptyState({ message }) {
  return (
    <div className="border border-dashed border-line px-6 py-10 text-center font-mono text-xs tracking-wide text-muted">
      {message}
    </div>
  );
}
