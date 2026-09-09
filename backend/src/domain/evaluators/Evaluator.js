/**
 * Evaluator abstraction.
 *
 * Only HumanEvaluator is implemented in this MVP, but this base class
 * defines the contract so future evaluation strategies (e.g. AIEvaluator,
 * RuleBasedEvaluator) can be added later without changing the learner's
 * practice flow or EvaluationService.
 *
 * Any subclass must implement:
 *   async evaluate(submission, rubric, input) -> EvaluationResult
 *
 * where EvaluationResult is a plain object shaped like:
 *   {
 *     criteria: [{ criterion, score, maxScore, evidence, concern, suggestion }],
 *     totalScore: number,
 *     strengths: string[],
 *     improvements: string[],
 *     nextAttemptFocus: string[],
 *     generalFeedback?: string,
 *   }
 */
class Evaluator {
  // eslint-disable-next-line no-unused-vars
  async evaluate(submission, rubric, input) {
    throw new Error("Evaluator.evaluate() must be implemented by a subclass");
  }
}

module.exports = { Evaluator };
