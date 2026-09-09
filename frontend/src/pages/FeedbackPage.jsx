import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";
import { Panel } from "../components/Panel";
import { StatusBadge } from "../components/Badges";
import { Button } from "../components/Button";
import { ScoreGauge } from "../components/ScoreGauge";
import { Loading, ErrorState, EmptyState } from "../components/States";

export function FeedbackPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [problem, setProblem] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (!id) return;
    api
      .getAttempt(id)
      .then(async (data) => {
        setAttempt(data);
        if (typeof data.problemId !== "string") setProblem(data.problemId);
        if (["COMPLETED", "EVALUATING", "FAILED"].includes(data.status)) {
          try {
            setEvaluation(await api.getEvaluation(id));
          } catch {
            // no evaluation yet
          }
        }
      })
      .catch((err) => setError(err.message));
  }, [id]);

  async function handleRetry() {
    if (!attempt) return;
    setRetrying(true);
    try {
      const { attempt: newAttempt } = await api.retryAttempt(attempt._id);
      navigate(`/attempts/${newAttempt._id}/practice`);
    } catch (err) {
      setError(err.message);
    } finally {
      setRetrying(false);
    }
  }

  if (error) return <ErrorState message={error} />;
  if (!attempt) return <Loading label="loading attempt" />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[11px] tracking-widest text-cyan">ATTEMPT RECORD</p>
          <h1 className="mt-1 font-display text-xl font-semibold text-ink">
            {problem?.title || "Attempt"} <span className="text-muted">· #{attempt.attemptNumber}</span>
          </h1>
        </div>
        <StatusBadge status={attempt.status} live={attempt.status === "SUBMITTED" || attempt.status === "EVALUATING"} />
      </div>

      {attempt.status === "IN_PROGRESS" && (
        <Panel quiet>
          <p className="text-sm text-muted">
            This attempt is still in progress.{" "}
            <Link to={`/attempts/${attempt._id}/practice`} className="text-cyan hover:underline">
              Continue working on it
            </Link>
            .
          </p>
        </Panel>
      )}

      {attempt.status === "SUBMITTED" && (
        <Panel quiet>
          <p className="text-sm text-muted">Your submission is queued for human review. Check back for feedback.</p>
        </Panel>
      )}

      {attempt.status === "EVALUATING" && (
        <Panel quiet>
          <p className="text-sm text-muted">An admin is reviewing this submission right now.</p>
        </Panel>
      )}

      {attempt.status === "FAILED" && (
        <Panel className="border-danger/40">
          <p className="font-mono text-xs text-danger">
            evaluation could not be completed — your submission is safe and will be re-reviewed.
          </p>
        </Panel>
      )}

      {attempt.status === "COMPLETED" && evaluation && (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-[auto_1fr]">
            <Panel className="flex items-center justify-center">
              <ScoreGauge score={evaluation.totalScore} />
            </Panel>
            <Panel label="GENERAL FEEDBACK">
              <p className="text-sm leading-relaxed text-ink/90">
                {evaluation.generalFeedback || "No general feedback was provided."}
              </p>
            </Panel>
          </div>

          <Panel label="RUBRIC BREAKDOWN">
            <div className="flex flex-col divide-y divide-line">
              {evaluation.criteria.map((c) => (
                <div key={c.criterion} className="py-4 first:pt-0 last:pb-0">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium text-ink">{c.criterion}</p>
                    <p className="font-mono text-sm text-cyan">
                      {c.score}
                      <span className="text-muted">/{c.maxScore}</span>
                    </p>
                  </div>
                  <div className="mb-2 h-1 w-full bg-line">
                    <div
                      className="h-1 bg-cyan transition-all duration-700 ease-out"
                      style={{ width: `${(c.score / c.maxScore) * 100}%` }}
                    />
                  </div>
                  {c.evidence && <p className="font-mono text-[11px] leading-relaxed text-muted">evidence — {c.evidence}</p>}
                  {c.concern && <p className="mt-1 font-mono text-[11px] leading-relaxed text-amber">concern — {c.concern}</p>}
                  {c.suggestion && (
                    <p className="mt-1 font-mono text-[11px] leading-relaxed text-cyan">suggestion — {c.suggestion}</p>
                  )}
                </div>
              ))}
            </div>
          </Panel>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Panel label="STRENGTHS">
              {evaluation.strengths.length === 0 ? (
                <EmptyState message="none listed" />
              ) : (
                <ul className="flex flex-col gap-2 text-sm text-ink/90">
                  {evaluation.strengths.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-cyan">+</span>
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
            <Panel label="IMPROVEMENTS">
              {evaluation.improvements.length === 0 ? (
                <EmptyState message="none listed" />
              ) : (
                <ul className="flex flex-col gap-2 text-sm text-ink/90">
                  {evaluation.improvements.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-amber">△</span>
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>

          <Panel label="FOCUS FOR NEXT ATTEMPT">
            {evaluation.nextAttemptFocus.length === 0 ? (
              <EmptyState message="none listed" />
            ) : (
              <ul className="flex flex-col gap-2 text-sm text-ink/90">
                {evaluation.nextAttemptFocus.map((s, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-cyan">→</span>
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Button onClick={handleRetry} disabled={retrying} className="w-fit">
            {retrying ? "provisioning attempt..." : "Try Again"}
          </Button>
        </>
      )}
    </div>
  );
}
