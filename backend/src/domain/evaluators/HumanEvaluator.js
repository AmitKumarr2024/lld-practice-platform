const { Evaluator } = require("./Evaluator");

/**
 * HumanEvaluator packages an admin's manual rubric scoring into a validated
 * EvaluationResult. It does not compute scores itself -- the human evaluator
 * provides them -- but it enforces that every criterion is present and that
 * no score exceeds its rubric maximum, keeping the resulting data trustworthy.
 */
class HumanEvaluator extends Evaluator {
  async evaluate(_submission, rubric, input) {
    const rubricByName = new Map(rubric.map((r) => [r.criterion, r.maxScore]));

    if (input.criteria.length !== rubric.length) {
      throw new Error("All rubric criteria must be scored");
    }

    let totalScore = 0;
    const criteria = input.criteria.map((c) => {
      const maxScore = rubricByName.get(c.criterion);
      if (maxScore === undefined) {
        throw new Error(`Unknown criterion: ${c.criterion}`);
      }
      if (c.score < 0 || c.score > maxScore) {
        throw new Error(`Score for ${c.criterion} must be between 0 and ${maxScore}`);
      }
      totalScore += c.score;
      return {
        criterion: c.criterion,
        score: c.score,
        maxScore,
        evidence: c.evidence || "",
        concern: c.concern || "",
        suggestion: c.suggestion || "",
      };
    });

    if (totalScore > 100) {
      throw new Error("Total score must not exceed 100");
    }

    return {
      criteria,
      totalScore,
      strengths: input.strengths || [],
      improvements: input.improvements || [],
      nextAttemptFocus: input.nextAttemptFocus || [],
      generalFeedback: input.generalFeedback || "",
    };
  }
}

module.exports = { HumanEvaluator };
