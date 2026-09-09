import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../features/auth/AuthContext";
import { Panel } from "../components/Panel";
import { StatusBadge } from "../components/Badges";
import { Loading, ErrorState, EmptyState } from "../components/States";
import { HeroSchematic } from "../components/HeroSchematic";

export function HomePage() {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    api
      .listAttempts()
      .then((data) => setAttempts(data.slice(0, 5)))
      .catch((err) => setError(err.message));
  }, [user]);

  return (
    <div className="flex flex-col gap-16">
      <section className="grid grid-cols-1 items-center gap-10 sm:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="font-mono text-[11px] tracking-widest text-cyan">LLD PRACTICE / DESIGN BENCH</p>
          <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            Design it. Submit it.
            <br />
            Get told exactly why.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
            Four systems, one rubric, and a human evaluator who explains every point. Work through the loop
            as many times as it takes for the design to hold up.
          </p>
          <Link
            to="/problems"
            className="btn-primary mt-6 inline-flex bg-cyan px-5 py-2.5 font-body text-sm font-medium text-void hover:bg-cyan/90"
          >
            Open the problem set
          </Link>
        </div>
        <HeroSchematic />
      </section>

      {user && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-mono text-[11px] tracking-widest text-muted">RECENT ATTEMPTS</h2>
            <Link to="/history" className="font-mono text-[11px] tracking-wide text-cyan hover:underline">
              view all →
            </Link>
          </div>
          {error && <ErrorState message={error} />}
          {!attempts && !error && <Loading label="loading attempts" />}
          {attempts && attempts.length === 0 && (
            <EmptyState message="no attempts yet — pick a problem to begin" />
          )}
          {attempts && attempts.length > 0 && (
            <div className="flex flex-col divide-y divide-line border border-line">
              {attempts.map((a) => {
                const problem = typeof a.problemId === "string" ? null : a.problemId;
                return (
                  <Link
                    key={a._id}
                    to={`/attempts/${a._id}`}
                    className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-panel-raised"
                  >
                    <div>
                      <p className="text-sm font-medium text-ink">{problem?.title || "Problem"}</p>
                      <p className="font-mono text-[11px] text-muted">attempt #{a.attemptNumber}</p>
                    </div>
                    <StatusBadge status={a.status} live={a.status === "SUBMITTED" || a.status === "EVALUATING"} />
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
