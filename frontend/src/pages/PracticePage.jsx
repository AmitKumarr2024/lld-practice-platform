import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";
import { Panel } from "../components/Panel";
import { Button } from "../components/Button";
import { StatusBadge } from "../components/Badges";
import { Loading, ErrorState } from "../components/States";

const SECTIONS = [
  { key: "assumptions", label: "Assumptions", help: "What are you taking for granted about this problem?", required: true },
  { key: "requirements", label: "Requirements", help: "How do you read the functional requirements?", required: true },
  { key: "classes", label: "Classes / Interfaces", help: "What classes and interfaces do you propose?", required: true, tall: true },
  { key: "relationships", label: "Relationships", help: "How do the classes interact with each other?", required: true },
  { key: "designPatterns", label: "Design Patterns", help: "Optional — explain why a pattern is (or isn't) used.", required: false },
  { key: "edgeCases", label: "Edge Cases", help: "What unusual or failure scenarios should the design handle?", required: true },
  { key: "tradeOffs", label: "Trade-offs", help: "Why this design over the alternatives you considered?", required: true },
  { key: "pseudocode", label: "Pseudocode", help: "Optional — sketch the important methods.", required: false, tall: true },
];

const emptySubmission = {
  assumptions: "",
  requirements: "",
  classes: "",
  relationships: "",
  designPatterns: "",
  edgeCases: "",
  tradeOffs: "",
  pseudocode: "",
};

export function PracticePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [problem, setProblem] = useState(null);
  const [form, setForm] = useState(emptySubmission);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    if (!id) return;
    api
      .getAttempt(id)
      .then((data) => {
        setAttempt(data);
        setForm({ ...emptySubmission, ...data.submission });
        if (typeof data.problemId !== "string") setProblem(data.problemId);
      })
      .catch((err) => setError(err.message));
  }, [id]);

  const handleChange = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const filledCount = useMemo(
    () => SECTIONS.filter((s) => (form[s.key] || "").trim().length > 0).length,
    [form]
  );
  const progressPct = Math.round((filledCount / SECTIONS.length) * 100);

  async function handleSave() {
    if (!id) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await api.saveDraft(id, form);
      setAttempt(updated);
      setSavedAt(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit() {
    if (!id) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.saveDraft(id, form);
      await api.submitAttempt(id);
      navigate(`/attempts/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (error && !attempt) return <ErrorState message={error} />;
  if (!attempt) return <Loading label="loading workbench" />;

  const readOnly = attempt.status !== "IN_PROGRESS";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] tracking-widest text-cyan">DESIGN WORKBENCH</p>
          <h1 className="mt-1 font-display text-xl font-semibold text-ink">
            {problem?.title || "Practice"} <span className="text-muted">· attempt #{attempt.attemptNumber}</span>
          </h1>
        </div>
        <StatusBadge status={attempt.status} live={attempt.status === "IN_PROGRESS"} />
      </div>

      {!readOnly && (
        <div className="flex items-center gap-3">
          <div className="h-1 flex-1 bg-line">
            <div
              className="h-1 bg-cyan transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="font-mono text-[11px] tracking-wide text-muted">
            {filledCount}/{SECTIONS.length} sections
          </span>
        </div>
      )}

      {readOnly && (
        <Panel quiet>
          <p className="font-mono text-xs text-amber">
            this attempt is {attempt.status.toLowerCase()} — the design below is locked.
          </p>
        </Panel>
      )}

      {error && <ErrorState message={error} />}

      <div className="flex flex-col gap-5">
        {SECTIONS.map((section, i) => {
          const filled = (form[section.key] || "").trim().length > 0;
          return (
            <Panel key={section.key} className="relative">
              <div className="mb-2 flex items-baseline justify-between">
                <label className="font-display text-sm font-semibold text-ink">
                  {String(i + 1).padStart(2, "0")} · {section.label}
                  {section.required && <span className="ml-1 text-cyan">*</span>}
                </label>
                {filled && <span className="font-mono text-[10px] tracking-wide text-cyan">filled</span>}
              </div>
              <p className="mb-3 font-mono text-[11px] leading-relaxed text-muted">{section.help}</p>
              <textarea
                rows={section.tall ? 7 : 3}
                disabled={readOnly}
                value={form[section.key] || ""}
                onChange={(e) => handleChange(section.key, e.target.value)}
                className="w-full border border-line px-3 py-2.5 font-mono text-sm text-ink transition-colors focus:border-cyan focus:outline-none disabled:text-muted"
                placeholder={`// ${section.label.toLowerCase()}...`}
              />
            </Panel>
          );
        })}
      </div>

      {!readOnly && (
        <div className="flex items-center gap-4">
          <Button variant="secondary" onClick={handleSave} disabled={saving}>
            {saving ? "saving..." : "Save Draft"}
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "submitting..." : "Submit"}
          </Button>
          {savedAt && <span className="font-mono text-[11px] text-muted">saved at {savedAt}</span>}
        </div>
      )}
    </div>
  );
}
