# DESIGN.md

## 1. Product Goal

Help learners repeatedly practice LLD problems and receive useful, explainable feedback, through the loop: **Choose Problem → Think/Design → Submit → Get Feedback → Review → Try Again.**

## 2. Scope

In scope: 4 seeded LLD problems, structured text submissions, human/admin rubric-based evaluation, attempt history, retry, and score comparison. Out of scope: AI evaluation, UML editors, code execution, real-time collaboration, notifications, analytics dashboards, and any distributed-systems infrastructure (see §6 and §13).

## 3. User Journey

**Learner:** browse problems → open a problem → start an attempt → fill the structured design workspace → save draft (repeatable) → submit → wait for evaluation → view score + rubric breakdown + strengths/improvements/next-attempt focus → view history → retry (creates a new attempt) → compare scores across attempts.

**Admin:** see pending submissions on a dashboard → open a submission → read the problem and the learner's design → score each rubric criterion with evidence/concern/suggestion → add strengths, improvements, and next-attempt focus → submit the evaluation, which completes the attempt.

## 4. Submission Model

A submission is structured text, not a diagram or executable code: assumptions, requirements understanding, classes/interfaces, responsibilities (folded into classes), relationships, optional design patterns (with justification), edge cases, trade-offs, and optional pseudocode. This is sufficient to evaluate requirement understanding, responsibilities, abstraction, coupling/cohesion, extensibility, edge-case handling, and reasoning quality, without the cost of building a diagram editor or code sandbox in a 2-day window.

## 5. Domain Model

```text
User
 |
 +----> Attempt
          |
          +----> Problem
          |
          +----> Submission (embedded in Attempt)
          |
          +----> Evaluation
                    |
                    +----> Feedback (fields on Evaluation)
```

`User → creates Attempt → belongs to Problem, contains Submission → is evaluated through Evaluation → contains Feedback`. No entities beyond this were introduced; Submission is embedded directly in Attempt rather than modeled as a separate collection, since it is always read and written together with its parent attempt.

## 6. Backend Architecture

Simple monolithic Express + JavaScript app (CommonJS, no TypeScript) with a layered structure: thin `controllers/` (HTTP parsing + response), `services/` (business logic, orchestration, validation of business rules), `domain/` (rubric definition and the `Evaluator` abstraction), `models/` (Mongoose schemas), `routes/` (wiring), and `middleware/` (auth, role checks, centralized error handling). Controllers never talk to Mongoose models directly — they go through services — keeping business logic out of the HTTP layer and easy to unit test.

## 7. Evaluation Architecture

```ts
interface Evaluator {
  evaluate(submission: Submission, rubric: Rubric, input: unknown): Promise<EvaluationResult>;
}
```

`HumanEvaluator` is the only implementation in this MVP: it validates an admin's manual rubric scores (every criterion present, no score over its max, total ≤ 100) and packages them into a consistent `EvaluationResult`. Because `AttemptService`/`EvaluationService` depend only on the `Evaluator` interface, a future `AIEvaluator` or `RuleBasedEvaluator` could be introduced later without changing the learner's practice flow, the API contract, or the Attempt state machine.

## 8. State Transitions

```text
IN_PROGRESS --submit--> SUBMITTED --admin starts evaluation--> EVALUATING --> COMPLETED
                                                                          \--> FAILED
```

Enforced rules: only an `IN_PROGRESS` attempt can be submitted; a submitted attempt cannot be edited or resubmitted; only `SUBMITTED` (or previously `FAILED`) attempts can enter evaluation; a `COMPLETED` evaluation cannot be silently overwritten; retry always creates a brand-new `Attempt` document rather than mutating an existing one, so prior attempts stay immutable history.

## 9. Failure Handling

If evaluation input fails validation (e.g. a missing criterion or an out-of-range score), the service marks the `Evaluation` and `Attempt` as `FAILED` but never deletes or mutates the learner's stored submission. An admin can re-submit a corrected evaluation for the same attempt at any time while it is not yet `COMPLETED`. No queue or retry infrastructure was needed for this — a synchronous service call with explicit status transitions is enough at this scale.

## 10. Extensibility

The `Evaluator` interface (implemented here as a small base class with an `evaluate()` contract, since plain JavaScript has no `interface` keyword) is the main extensibility seam (see §7). The rubric itself is defined once in `domain/rubric/Rubric.js` and consumed by both the evaluator and the validation logic, so it can be changed in one place. New problems only require new `Problem` documents (no code changes). New submission sections would require a schema/UI change but no architectural change, since `Submission` is a single embedded document with well-named fields.

## 11. Database Design

MongoDB with four collections: `users`, `problems`, `attempts` (with `submission` embedded), `evaluations` (referencing `attemptId`). Submission was intentionally embedded rather than split into its own collection to avoid an extra join for the single most common read/write path (loading or saving a learner's in-progress design) — this is a deliberate reduction of complexity appropriate for the MVP's scale, not a general modeling default.

## 12. API Design

REST, resource-oriented, matching the assignment's specified surface: `GET/POST /api/problems`, `POST/GET/PUT /api/attempts` plus `POST /api/attempts/:id/submit`, `GET/POST /api/evaluations/:attemptId`, and `GET /api/admin/attempts`. Auth endpoints (`/api/auth/login`, `/register`, `/me`) were added as necessary supporting infrastructure. All admin-only routes are protected by role middleware.

## 13. Key Trade-offs

- **Monolith over microservices:** the assignment is about LLD/domain design, not distributed systems; a monolith keeps the two-day budget focused on the parts that matter.
- **Human evaluation over an LLM API:** avoids external cost/dependency and unpredictable grading behavior, and keeps the app fully functional without any API key.
- **Structured text over a diagram/code editor:** captures the reasoning needed for evaluation (responsibilities, abstraction, coupling, edge cases) without the multi-day cost of building or integrating a canvas/IDE.
- **Embedded submission over a separate collection:** simpler reads/writes for the dominant access pattern, at the cost of slightly less normalized data.
- **No Kafka/Redis/queues:** evaluation volume for an MVP does not justify the operational complexity; a direct service call already gives clear, auditable state transitions.

## 14. Future Improvements

See `README.md` → **Future Improvements** (AI evaluator, diagram/code submission, background evaluation worker, reviewer assignment, richer analytics) — all designed to slot into the existing `Evaluator` abstraction and state machine rather than requiring a rewrite.

## 15. Accommodating Future Changes

Two specific future changes were considered while designing the domain model, and neither requires rewriting the Attempt/Evaluation flow:

**Change A: Text submission → class diagram submission.**
`Submission` is a single embedded document on `Attempt` with named fields (`assumptions`, `classes`, `relationships`, etc.). Adding a diagram format means adding a new field (e.g. `diagramData: string` holding serialized diagram JSON, or a `submissionType` discriminator) to this same document — the `Attempt` state machine, the `Evaluator` interface, and the API surface (`PUT /api/attempts/:id`, `POST /api/attempts/:id/submit`) are all format-agnostic and would not change. Only the frontend Practice page's input control and the admin's read-only submission view would need new rendering logic for the diagram case.

**Change B: Human evaluator → automated/LLM evaluator.**
`EvaluationService` depends only on the `Evaluator` interface (`evaluate(submission, rubric, input): Promise<EvaluationResult>`), not on `HumanEvaluator` directly. Introducing an `AutomatedEvaluationService`/`LLMEvaluationService` means writing a new class that implements `Evaluator` and returns the same `EvaluationResult` shape (criteria, totalScore, strengths, improvements, nextAttemptFocus). `EvaluationService.submitEvaluation` would select which evaluator to invoke (e.g. by attempt type or a feature flag) without touching the Attempt state machine, the rubric definition, or any API route. The `Evaluation` document schema already stores an optional `evaluatorId`, so an automated evaluator could be represented as a system user or a distinct field with no schema migration beyond that.

## Why the application is intentionally a monolith

The assignment explicitly asks candidates not to turn this into an HLD/distributed-systems exercise. A monolith keeps the entire system — API, business logic, and persistence — understandable as a single deployable unit, which matches both the two-day timeframe and the actual traffic/scale of a practice tool used by a small group of learners and admins. Every piece of infrastructure explicitly excluded (Kafka, Redis, microservices, Kubernetes, sharding, etc.) would add operational and cognitive overhead without improving the learner's actual practice loop, which is the metric that matters here.
