import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { StatusBadge } from "../components/Badges";
import { Loading, ErrorState, EmptyState } from "../components/States";

export function HistoryPage() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .listAttempts()
      .then(async (attempts) => {
        const withScores = await Promise.all(
          attempts.map(async (a) => {
            if (a.status !== "COMPLETED") return { attempt: a, score: null };
            try {
              const evaluation = await api.getEvaluation(a._id);
              return { attempt: a, score: evaluation.totalScore };
            } catch {
              return { attempt: a, score: null };
            }
          })
        );
        setRows(withScores);
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <ErrorState message={error} />;
  if (!rows) return <Loading label="loading history" />;
  if (rows.length === 0) return <EmptyState message="you haven't attempted any problems yet" />;

  const byProblem = {};
  for (const row of rows) {
    const pid = typeof row.attempt.problemId === "string" ? row.attempt.problemId : row.attempt.problemId._id;
    byProblem[pid] = byProblem[pid] || [];
    byProblem[pid].push(row);
  }
  const deltaByAttemptId = {};
  Object.values(byProblem).forEach((groupRows) => {
    const completed = [...groupRows]
      .filter((r) => r.score !== null)
      .sort((a, b) => a.attempt.attemptNumber - b.attempt.attemptNumber);
    for (let i = 1; i < completed.length; i++) {
      deltaByAttemptId[completed[i].attempt._id] = completed[i].score - completed[i - 1].score;
    }
  });

  return (
    <div>
      <p className="font-mono text-[11px] tracking-widest text-cyan">ATTEMPT LOG</p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-ink">History</h1>

      <div className="mt-8 flex flex-col divide-y divide-line border border-line">
        {rows.map(({ attempt, score }) => {
          const problem = typeof attempt.problemId === "string" ? null : attempt.problemId;
          const delta = deltaByAttemptId[attempt._id];
          const linkTo =
            attempt.status === "IN_PROGRESS" ? `/attempts/${attempt._id}/practice` : `/attempts/${attempt._id}`;
          const linkLabel = attempt.status === "IN_PROGRESS" ? "continue →" : "view feedback →";
          return (
            <Link
              key={attempt._id}
              to={linkTo}
              className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-panel-raised"
            >
              <div>
                <p className="text-sm font-medium text-ink">
                  {problem?.title || "Problem"} <span className="text-muted">· #{attempt.attemptNumber}</span>
                </p>
                <p className="mt-1 font-mono text-[11px] text-muted">
                  {new Date(attempt.startedAt).toLocaleDateString()}
                  {score !== null && <> · score {score}/100</>}
                  {delta !== undefined && (
                    <span className={delta >= 0 ? " text-cyan" : " text-danger"}>
                      {" "}
                      ({delta >= 0 ? "+" : ""}
                      {delta} vs previous)
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <StatusBadge status={attempt.status} />
                <span className="font-mono text-[11px] tracking-wide text-cyan">{linkLabel}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
