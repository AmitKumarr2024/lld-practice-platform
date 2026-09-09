const difficultyColor = {
  EASY: "text-cyan border-cyan/40",
  MEDIUM: "text-amber border-amber/40",
  HARD: "text-danger border-danger/40",
};

export function DifficultyBadge({ level }) {
  return (
    <span
      className={`inline-block border px-2 py-0.5 font-mono text-[11px] tracking-wide ${
        difficultyColor[level] || "text-muted border-line"
      }`}
    >
      {level}
    </span>
  );
}

const statusColor = {
  IN_PROGRESS: "text-muted",
  SUBMITTED: "text-amber",
  EVALUATING: "text-amber",
  COMPLETED: "text-cyan",
  FAILED: "text-danger",
  PENDING: "text-muted",
};

const statusLabel = {
  IN_PROGRESS: "in progress",
  SUBMITTED: "awaiting review",
  EVALUATING: "evaluating",
  COMPLETED: "completed",
  FAILED: "failed",
  PENDING: "pending",
};

export function StatusBadge({ status, live = false }) {
  const color = statusColor[status] || "text-muted";
  return (
    <span className={`relative inline-flex items-center gap-2 font-mono text-[11px] tracking-wide ${color}`}>
      <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-current">
        {live && <span className="status-ping absolute inset-0" />}
      </span>
      {statusLabel[status] || status}
    </span>
  );
}
