import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";
import { Panel } from "../components/Panel";
import { StatusBadge } from "../components/Badges";
import { Button } from "../components/Button";
import { Loading, ErrorState } from "../components/States";

const RUBRIC = [
  { criterion: "Requirement Understanding", maxScore: 15 },
  { criterion: "Class Responsibilities", maxScore: 20 },
  { criterion: "Encapsulation", maxScore: 15 },
  { criterion: "Coupling & Cohesion", maxScore: 15 },
  { criterion: "Abstraction / Interfaces", maxScore: 10 },
  { criterion: "Extensibility", maxScore: 10 },
  { criterion: "Edge Cases", maxScore: 10 },
  { criterion: "Explanation Quality", maxScore: 5 },
];

const SUBMISSION_FIELDS = [
  ["Assumptions", "assumptions"],
  ["Requirements", "requirements"],
  ["Classes / Interfaces", "classes"],
  ["Relationships", "relationships"],
  ["Design Patterns", "designPatterns"],
  ["Edge Cases", "edgeCases"],
  ["Trade-offs", "tradeOffs"],
  ["Pseudocode", "pseudocode"],
];

export function AdminEvaluationPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [problem, setProblem] = useState(null);
  const [learner, setLearner] = useState(null);
  const [criteria, setCriteria] = useState(
    RUBRIC.map((r) => ({ ...r, score: "", evidence: "", concern: "", suggestion: "" }))
  );
  const [strengths, setStrengths] = useState("");
  const [improvements, setImprovements] = useState("");
  const [nextFocus, setNextFocus] = useState("");
  const [generalFeedback, setGeneralFeedback] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [readOnly, setReadOnly] = useState(false);

  useEffect(() => {
    if (!id) return;
    // Admin-only endpoint: does not enforce the learner-ownership check,
    // because an admin is authorized to review any learner's submission.
    api
      .getAdminAttempt(id)
      .then(async (data) => {
        setAttempt(data);
        if (typeof data.problemId !== "string") setProblem(data.problemId);
        if (typeof data.userId !== "string") setLearner(data.userId);

        if (data.status === "COMPLETED") {
          setReadOnly(true);
          const evalData = await api.getEvaluation(id);
          setCriteria(
            evalData.criteria.map((c) => ({
              criterion: c.criterion,
              maxScore: c.maxScore,
              score: String(c.score),
              evidence: c.evidence || "",
              concern: c.concern || "",
              suggestion: c.suggestion || "",
            }))
          );
          setStrengths(evalData.strengths.join("\n"));
          setImprovements(evalData.improvements.join("\n"));
          setNextFocus(evalData.nextAttemptFocus.join("\n"));
          setGeneralFeedback(evalData.generalFeedback || "");
        }
      })
      .catch((err) => setError(err.message));
  }, [id]);

  function updateCriterion(idx, field, value) {
    setCriteria((prev) => prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c)));
  }

  const totalScore = criteria.reduce((sum, c) => sum + (parseInt(c.score, 10) || 0), 0);

  async function handleSubmit() {
    if (!id) return;
    setError(null);

    for (const c of criteria) {
      const score = parseInt(c.score, 10);
      if (Number.isNaN(score) || score < 0 || score > c.maxScore) {
        setError(`Score for "${c.criterion}" must be between 0 and ${c.maxScore}`);
        return;
      }
    }

    setSubmitting(true);
    try {
      await api.submitEvaluation(id, {
        criteria: criteria.map((c) => ({
          criterion: c.criterion,
          score: parseInt(c.score, 10),
          evidence: c.evidence,
          concern: c.concern,
          suggestion: c.suggestion,
        })),
        strengths: strengths.split("\n").map((s) => s.trim()).filter(Boolean),
        improvements: improvements.split("\n").map((s) => s.trim()).filter(Boolean),
        nextAttemptFocus: nextFocus.split("\n").map((s) => s.trim()).filter(Boolean),
        generalFeedback,
      });
      navigate("/admin");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (error && !attempt) return <ErrorState message={error} />;
  if (!attempt) return <Loading label="loading submission" />;

  const submission = attempt.submission;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[11px] tracking-widest text-cyan">REVIEW</p>
          <h1 className="mt-1 font-display text-xl font-semibold text-ink">
            {problem?.title} <span className="text-muted">· attempt #{attempt.attemptNumber}</span>
          </h1>
          {learner && <p className="mt-1 font-mono text-[11px] text-muted">learner — {learner.name}</p>}
        </div>
        <StatusBadge status={attempt.status} />
      </div>

      {attempt.status === "FAILED" && (
        <Panel className="border-amber/40">
          <p className="font-mono text-xs text-amber">
            a previous evaluation attempt failed — the learner's submission is unchanged, you can retry the review
            below.
          </p>
        </Panel>
      )}

      <Panel label="LEARNER SUBMISSION">
        <div className="flex flex-col gap-4">
          {SUBMISSION_FIELDS.filter(([, key]) => submission[key] && submission[key].trim()).map(([label, key]) => (
            <div key={key}>
              <p className="mb-1 font-mono text-[11px] tracking-wide text-muted">{label}</p>
              <p className="whitespace-pre-line border-l-2 border-line-bright pl-3 font-mono text-xs leading-relaxed text-ink/80">
                {submission[key]}
              </p>
            </div>
          ))}
        </div>
      </Panel>

      {error && <ErrorState message={error} />}

      <Panel label="RUBRIC">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono text-[11px] text-muted">score each criterion</span>
          <span className="font-mono text-sm text-cyan">
            total {totalScore}
            <span className="text-muted">/100</span>
          </span>
        </div>
        <div className="flex flex-col divide-y divide-line">
          {criteria.map((c, idx) => (
            <div key={c.criterion} className="grid grid-cols-1 gap-3 py-4 sm:grid-cols-[1fr_90px]">
              <div>
                <p className="text-sm font-medium text-ink">{c.criterion}</p>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <input
                    disabled={readOnly}
                    placeholder="evidence"
                    value={c.evidence}
                    onChange={(e) => updateCriterion(idx, "evidence", e.target.value)}
                    className="border border-line px-2 py-1.5 font-mono text-xs text-ink focus:border-cyan focus:outline-none disabled:text-muted"
                  />
                  <input
                    disabled={readOnly}
                    placeholder="concern (optional)"
                    value={c.concern}
                    onChange={(e) => updateCriterion(idx, "concern", e.target.value)}
                    className="border border-line px-2 py-1.5 font-mono text-xs text-ink focus:border-cyan focus:outline-none disabled:text-muted"
                  />
                  <input
                    disabled={readOnly}
                    placeholder="suggestion (optional)"
                    value={c.suggestion}
                    onChange={(e) => updateCriterion(idx, "suggestion", e.target.value)}
                    className="border border-line px-2 py-1.5 font-mono text-xs text-ink focus:border-cyan focus:outline-none disabled:text-muted"
                  />
                </div>
              </div>
              <div className="flex items-start justify-end gap-1">
                <input
                  disabled={readOnly}
                  type="number"
                  min={0}
                  max={c.maxScore}
                  value={c.score}
                  onChange={(e) => updateCriterion(idx, "score", e.target.value)}
                  className="w-16 border border-line px-2 py-1.5 text-right font-mono text-sm text-ink focus:border-cyan focus:outline-none disabled:text-muted"
                />
                <span className="pt-1.5 font-mono text-xs text-muted">/{c.maxScore}</span>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Panel label="STRENGTHS">
          <textarea
            disabled={readOnly}
            rows={4}
            value={strengths}
            onChange={(e) => setStrengths(e.target.value)}
            placeholder="one per line"
            className="w-full border border-line px-3 py-2 font-mono text-xs text-ink focus:border-cyan focus:outline-none disabled:text-muted"
          />
        </Panel>
        <Panel label="IMPROVEMENTS">
          <textarea
            disabled={readOnly}
            rows={4}
            value={improvements}
            onChange={(e) => setImprovements(e.target.value)}
            placeholder="one per line"
            className="w-full border border-line px-3 py-2 font-mono text-xs text-ink focus:border-cyan focus:outline-none disabled:text-muted"
          />
        </Panel>
        <Panel label="NEXT ATTEMPT FOCUS">
          <textarea
            disabled={readOnly}
            rows={4}
            value={nextFocus}
            onChange={(e) => setNextFocus(e.target.value)}
            placeholder="one per line"
            className="w-full border border-line px-3 py-2 font-mono text-xs text-ink focus:border-cyan focus:outline-none disabled:text-muted"
          />
        </Panel>
      </div>

      <Panel label="GENERAL FEEDBACK">
        <textarea
          disabled={readOnly}
          rows={3}
          value={generalFeedback}
          onChange={(e) => setGeneralFeedback(e.target.value)}
          className="w-full border border-line px-3 py-2 text-sm text-ink focus:border-cyan focus:outline-none disabled:text-muted"
        />
      </Panel>

      {!readOnly && (
        <Button onClick={handleSubmit} disabled={submitting} className="w-fit">
          {submitting ? "submitting..." : "Submit Evaluation"}
        </Button>
      )}
    </div>
  );
}
