import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";
import { Panel } from "../components/Panel";
import { DifficultyBadge } from "../components/Badges";
import { Button } from "../components/Button";
import { Loading, ErrorState } from "../components/States";

export function ProblemDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [error, setError] = useState(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.getProblem(id).then(setProblem).catch((err) => setError(err.message));
  }, [id]);

  async function handleStart() {
    setStarting(true);
    try {
      const { attempt } = await api.startAttempt(id);
      navigate(`/attempts/${attempt._id}/practice`);
    } catch (err) {
      setError(err.message);
    } finally {
      setStarting(false);
    }
  }

  if (error) return <ErrorState message={error} />;
  if (!problem) return <Loading label="loading specification" />;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-3">
          <p className="font-mono text-[11px] tracking-widest text-cyan">SPECIFICATION</p>
          <DifficultyBadge level={problem.difficulty} />
        </div>
        <h1 className="mt-2 font-display text-2xl font-semibold text-ink">{problem.title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">{problem.description}</p>
      </div>

      <Panel label="PROBLEM STATEMENT">
        <p className="whitespace-pre-line text-sm leading-relaxed text-ink/90">{problem.problemStatement}</p>
      </Panel>

      <Panel label="FUNCTIONAL REQUIREMENTS">
        <ul className="flex flex-col gap-2 text-sm text-ink/90">
          {problem.requirements.map((r, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-0.5 font-mono text-[11px] text-cyan">{String(i + 1).padStart(2, "0")}</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </Panel>

      {problem.constraints.length > 0 && (
        <Panel label="CONSTRAINTS / ASSUMPTIONS" quiet>
          <ul className="flex flex-col gap-2 text-sm text-muted">
            {problem.constraints.map((c, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-0.5 font-mono text-[11px] text-line-bright">·</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {error && <ErrorState message={error} />}

      <Button onClick={handleStart} disabled={starting} className="w-fit">
        {starting ? "provisioning attempt..." : "Start Practice"}
      </Button>
    </div>
  );
}
