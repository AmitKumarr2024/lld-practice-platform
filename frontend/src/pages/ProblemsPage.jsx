import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { Panel } from "../components/Panel";
import { DifficultyBadge } from "../components/Badges";
import { Loading, ErrorState, EmptyState } from "../components/States";

export function ProblemsPage() {
  const [problems, setProblems] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.listProblems().then(setProblems).catch((err) => setError(err.message));
  }, []);

  if (error) return <ErrorState message={error} />;
  if (!problems) return <Loading label="loading problem set" />;
  if (problems.length === 0) return <EmptyState message="no problems are available yet" />;

  return (
    <div>
      <p className="font-mono text-[11px] tracking-widest text-cyan">PROBLEM SET</p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-ink">Choose a system to design</h1>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {problems.map((p, i) => (
          <Link
            key={p._id}
            to={`/problems/${p._id}`}
            className="panel group flex flex-col justify-between p-6 opacity-0 transition-colors hover:border-cyan/50"
            style={{ animation: `node-in 0.4s ease-out forwards`, animationDelay: `${i * 0.06}s` }}
          >
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-[11px] text-muted">SYS-{String(i + 1).padStart(2, "0")}</span>
                <DifficultyBadge level={p.difficulty} />
              </div>
              <h2 className="font-display text-lg font-semibold text-ink group-hover:text-cyan">{p.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{p.description}</p>
            </div>
            <div className="mt-5 font-mono text-[11px] tracking-wide text-cyan opacity-0 transition-opacity group-hover:opacity-100">
              open specification →
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
