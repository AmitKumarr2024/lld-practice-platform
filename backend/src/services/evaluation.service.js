const { Evaluation } = require("../models/Evaluation");
const { Attempt } = require("../models/Attempt");
const { DEFAULT_RUBRIC } = require("../domain/rubric/Rubric");
const { HumanEvaluator } = require("../domain/evaluators/HumanEvaluator");
const { AppError } = require("../middleware/error.middleware");
const attemptService = require("./attempt.service");

const evaluator = new HumanEvaluator();

async function getEvaluationForAttempt(attemptId) {
  const evaluation = await Evaluation.findOne({ attemptId });
  if (!evaluation) {
    throw new AppError("Evaluation not found for this attempt", 404);
  }
  return evaluation;
}

async function listPendingAttempts() {
  return Attempt.find({ status: { $in: ["SUBMITTED", "FAILED"] } })
    .populate("problemId", "title slug difficulty")
    .populate("userId", "name email")
    .sort({ submittedAt: 1 });
}

async function listAllAdminAttempts() {
  return Attempt.find({ status: { $in: ["SUBMITTED", "EVALUATING", "COMPLETED", "FAILED"] } })
    .populate("problemId", "title slug difficulty")
    .populate("userId", "name email")
    .sort({ startedAt: -1 });
}

async function listCompletedAttempts() {
  return Attempt.find({ status: "COMPLETED" })
    .populate("problemId", "title slug difficulty")
    .populate("userId", "name email")
    .sort({ completedAt: -1 });
}

/**
 * Admin-only attempt lookup. Unlike attemptService.getAttempt(), this does
 * NOT check attempt ownership -- an admin is authorized to review any
 * learner's submission. Access control for this function is enforced at the
 * route level via requireRole("ADMIN"), not by comparing userId here.
 */
async function getAttemptForAdmin(attemptId) {
  const attempt = await Attempt.findById(attemptId)
    .populate("problemId")
    .populate("userId", "name email")
    .populate("evaluationId");

  if (!attempt) {
    throw new AppError("Attempt not found", 404);
  }

  return attempt;
}

async function submitEvaluation(evaluatorId, attemptId, input) {
  const attempt = await Attempt.findById(attemptId);
  if (!attempt) {
    throw new AppError("Attempt not found", 404);
  }
  if (attempt.status !== "SUBMITTED" && attempt.status !== "FAILED") {
    throw new AppError(`Attempt in status ${attempt.status} cannot be evaluated`, 400);
  }

  let evaluation = await Evaluation.findOne({ attemptId });
  if (!evaluation) {
    evaluation = await Evaluation.create({ attemptId, status: "PENDING" });
  }
  if (evaluation.status === "COMPLETED") {
    throw new AppError("Completed evaluation cannot be overwritten", 400);
  }

  await attemptService.markEvaluating(attemptId);
  evaluation.status = "IN_PROGRESS";
  await evaluation.save();

  try {
    const result = await evaluator.evaluate(attempt.submission, DEFAULT_RUBRIC, input);

    evaluation.criteria = result.criteria;
    evaluation.totalScore = result.totalScore;
    evaluation.strengths = result.strengths;
    evaluation.improvements = result.improvements;
    evaluation.nextAttemptFocus = result.nextAttemptFocus;
    evaluation.generalFeedback = result.generalFeedback;
    evaluation.evaluatorId = evaluatorId;
    evaluation.status = "COMPLETED";
    evaluation.completedAt = new Date();
    await evaluation.save();

    await attemptService.markCompleted(attemptId, evaluation._id.toString());
    return evaluation;
  } catch (err) {
    // Evaluation failed: submission is preserved, attempt is marked FAILED,
    // and the evaluation record stays available for retry.
    evaluation.status = "FAILED";
    await evaluation.save();
    await attemptService.markFailed(attemptId);
    throw err;
  }
}

module.exports = {
  getEvaluationForAttempt,
  listPendingAttempts,
  listAllAdminAttempts,
  listCompletedAttempts,
  getAttemptForAdmin,
  submitEvaluation,
};
