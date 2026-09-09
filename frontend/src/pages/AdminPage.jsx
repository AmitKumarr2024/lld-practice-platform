import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { StatusBadge } from "../components/Badges";
import { Loading, ErrorState, EmptyState } from "../components/States";

export function AdminPage() {
  const [pending, setPending] = useState(null);
  const [completed, setCompleted] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([api.listPendingReviews(), api.listCompletedReviews()])
      .then(([p, c]) => {
        setPending(p);
        setCompleted(c);
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <ErrorState message={error} />;
  if (!pending || !completed) return <Loading label="loading submission queue" />;

  function renderList(list, emptyMessage) {
    if (list.length === 0) return <EmptyState message={emptyMessage} />;
    return (
      <div className="flex flex-col divide-y divide-line border border-line">
        {list.map((a) => {
          const problem = typeof a.problemId === "string" ? null : a.problemId;
          const learner = typeof a.userId === "string" ? null : a.userId;
          return (
            <Link
              key={a._id}
              to={`/admin/attempts/${a._id}`}
              className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-panel-raised"
            >
              <div>
                <p className="text-sm font-medium text-ink">
                  {problem?.title || "Problem"} <span className="text-muted">· #{a.attemptNumber}</span>
                </p>
                <p className="mt-1 font-mono text-[11px] text-muted">{learner?.name || "learner"}</p>
              </div>
              <div className="flex items-center gap-4">
                <StatusBadge status={a.status} live={a.status === "SUBMITTED"} />
                <span className="font-mono text-[11px] tracking-wide text-cyan">
                  {a.status === "COMPLETED" ? "view →" : "evaluate →"}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <div>
        <p className="font-mono text-[11px] tracking-widest text-cyan">REVIEW QUEUE</p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-ink">Admin Dashboard</h1>
      </div>

      <section>
        <h2 className="mb-3 font-mono text-[11px] tracking-widest text-muted">
          PENDING REVIEWS ({pending.length})
        </h2>
        {renderList(pending, "nothing waiting for review")}
      </section>

      <section>
        <h2 className="mb-3 font-mono text-[11px] tracking-widest text-muted">
          COMPLETED REVIEWS ({completed.length})
        </h2>
        {renderList(completed, "no evaluations completed yet")}
      </section>
    </div>
  );
}
