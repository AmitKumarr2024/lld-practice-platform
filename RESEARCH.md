# RESEARCH.md

## Learner Problem

Low-Level Design is hard to practice because it is hard to *evaluate*. Unlike a coding problem, there is rarely a single correct answer — two reasonable designs for a Parking Lot can both be "correct" while differing sharply in extensibility, coupling, or clarity of responsibility. This makes self-assessment unreliable: a learner can produce a design that compiles conceptually but hides poor separation of concerns, tight coupling, or unhandled edge cases, and have no easy way to notice. Feedback that only says "good" or "needs work" doesn't tell the learner *what* to change next time, so repeated practice doesn't reliably turn into repeated improvement.

## Existing Approaches

A few categories of existing resources address parts of this problem:

- **LLD learning resources / courses** (e.g. structured interview-prep courses) typically walk through a small set of canonical problems with a single "reference" solution and explanation.
- **Interview preparation platforms** often focus on algorithmic/coding rounds, with LLD treated as a secondary, less-instrumented category compared to their coding-judge infrastructure.
- **GitHub LLD repositories** (community-maintained collections of solved LLD problems) provide worked example solutions in code, useful as reference material but with no feedback loop — a learner can only compare their own design to the reference after the fact.
- **Community discussions** (forums, video walkthroughs) surface multiple perspectives on the same problem, which is valuable, but feedback is generic and not tied to the individual learner's specific design choices.
- **Reference-solution-based practice** generally: the learner writes a design, then reads a "model answer" and self-grades the gap.

## Gaps

- Reference solutions can unintentionally imply there is *one* correct design, discouraging learners from justifying legitimate alternative trade-offs.
- Learners typically receive little to no *individualized* feedback tied to the specific classes, responsibilities, and reasoning they actually wrote.
- Repeated, structured improvement (attempt → feedback → retry → compare) is rarely built into these resources as a first-class loop; most are single-pass.
- Design *reasoning* — why a class exists, why a pattern was or wasn't used, how edge cases are handled — is inherently harder to evaluate automatically than code correctness, which is why most tooling in this space defaults to either no evaluation or a static reference-solution diff.

## Product Direction

This MVP focuses narrowly on: **practice + structured submission + human rubric feedback + retry/history**. Rather than trying to auto-grade design quality (which is unreliable) or build a full diagramming/code-execution environment (which is out of scope for a 2-day build), the platform captures a learner's reasoning in a structured text format sufficient for a human evaluator to give specific, criterion-level, explainable feedback — and makes retrying and comparing attempts a first-class, low-friction action.
