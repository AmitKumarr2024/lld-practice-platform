# AI_USAGE.md

This document is an honest record of where AI assistance shaped meaningful decisions while building the LLD Practice Platform. No LLM is integrated into the running product — the application is fully functional without any AI API key. AI was used only during development.

## 1. Submission format

**AI suggestion:** Early brainstorming considered whether the practice workspace should support an embedded diagram/UML editor or an inline code editor, since some LLD practice tools lean heavily on visual class diagrams.

**Decision:** Use a structured *textual* submission (assumptions, requirements, classes, relationships, patterns, edge cases, trade-offs, optional pseudocode) instead.

**Reason:** A diagram or code-execution editor is a multi-day feature on its own and was explicitly out of scope for this 2-day assignment. Structured text captures everything needed to evaluate responsibilities, abstraction, coupling/cohesion, and reasoning, while staying feasible to build and evaluate manually within the timeframe.

## 2. Evaluation design

**AI suggestion:** AI helped brainstorm a longer list of possible rubric dimensions (e.g. naming quality, testability, documentation clarity, performance considerations) beyond what was ultimately used.

**Decision:** The rubric was narrowed to a fixed 8-criterion, 100-point rubric (Requirement Understanding, Class Responsibilities, Encapsulation, Coupling & Cohesion, Abstraction/Interfaces, Extensibility, Edge Cases, Explanation Quality), scored entirely by a human evaluator.

**Reason:** A fixed rubric keeps evaluations comparable across attempts and learners, and human scoring avoids the unpredictability and cost of an LLM-based grader for this MVP. Extra dimensions were dropped to keep the form fast to fill out and the feedback focused.

## 3. Architecture

**AI suggestion:** When discussing how the system might scale (e.g. handling many concurrent evaluations, real-time status updates for learners, background grading jobs), AI raised the possibility of message queues (Kafka), a cache layer (Redis), or splitting services (microservices/Kubernetes).

**Decision:** None of these were adopted. The system is a single Express monolith talking directly to MongoDB, with synchronous service calls for evaluation.

**Reason:** The assignment explicitly asks candidates not to turn this into a distributed-systems project, and at MVP scale (a handful of learners/admins) this infrastructure would add operational overhead without improving the actual practice loop.

## 4. Evaluator abstraction

**AI suggestion:** AI suggested introducing an `Evaluator` interface early, even though only human evaluation would be implemented, so that future evaluation strategies (AI-based, rule-based) could be added later.

**Decision:** Implemented `Evaluator` as a small interface with a single `HumanEvaluator` implementation, consumed by `EvaluationService`.

**Reason:** This demonstrates the extensibility the assignment asks for without spending time building evaluators that aren't required for the MVP — a future `AIEvaluator` can be dropped in without touching the learner's practice flow or the Attempt state machine.

## 5. Testing

**AI suggestion:** AI helped identify edge cases worth testing beyond the "happy path," such as: submitting an already-submitted attempt, modifying a submitted attempt, evaluation scores exceeding a criterion's maximum, evaluation failure not deleting the submission, and retry preserving the previous attempt unchanged.

**Decision:** These cases were incorporated directly into the Vitest test suites for the Attempt and Evaluation services.

**Reason:** These are exactly the scenarios where a state-machine-based system is most likely to have silent bugs (double-submission, data loss on failure, accidental mutation of history), so they were prioritized over exhaustive line coverage.
