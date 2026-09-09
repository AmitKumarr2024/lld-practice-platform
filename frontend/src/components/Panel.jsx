export function Panel({ children, className = "", quiet = false, label = null }) {
  return (
    <div className={`panel ${quiet ? "panel-quiet" : ""} p-6 ${className}`}>
      {label && (
        <div className="mb-4 font-mono text-[11px] tracking-wide text-muted">{label}</div>
      )}
      {children}
    </div>
  );
}
