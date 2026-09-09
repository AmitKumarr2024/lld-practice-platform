const { z } = require("zod");
const evaluationService = require("../services/evaluation.service");

async function getEvaluationHandler(req, res, next) {
  try {
    const evaluation = await evaluationService.getEvaluationForAttempt(req.params.attemptId);
    res.json({ success: true, data: evaluation });
  } catch (err) {
    next(err);
  }
}

const criterionInputSchema = z.object({
  criterion: z.string(),
  score: z.number().min(0),
  evidence: z.string().optional(),
  concern: z.string().optional(),
  suggestion: z.string().optional(),
});

const evaluationInputSchema = z.object({
  criteria: z.array(criterionInputSchema).min(1),
  strengths: z.array(z.string()).optional(),
  improvements: z.array(z.string()).optional(),
  nextAttemptFocus: z.array(z.string()).optional(),
  generalFeedback: z.string().optional(),
});

async function submitEvaluationHandler(req, res, next) {
  try {
    const input = evaluationInputSchema.parse(req.body);
    const evaluation = await evaluationService.submitEvaluation(req.user.id, req.params.attemptId, input);
    res.json({ success: true, data: evaluation });
  } catch (err) {
    next(err);
  }
}

module.exports = { getEvaluationHandler, submitEvaluationHandler };
