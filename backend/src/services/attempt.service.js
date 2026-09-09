const { Attempt } = require("../models/Attempt");
const { Problem } = require("../models/Problem");
const { Evaluation } = require("../models/Evaluation");
const { AppError } = require("../middleware/error.middleware");

async function startAttempt(userId, problemId) {
  const problem = await Problem.findById(problemId);
  if (!problem || !problem.active) {
    throw new AppError("Problem not found", 404);
  }

  const previousCount = await Attempt.countDocuments({ userId, problemId });

  const attempt = await Attempt.create({
    userId,
    problemId,
    attemptNumber: previousCount + 1,
    status: "IN_PROGRESS",
    submission: {},
  });

  return attempt;
}

/**
 * Retry: starts a brand-new attempt for the same problem as an existing
 * attempt. The existing attempt is never modified -- this always creates a
 * new Attempt document with an incremented attemptNumber, so History keeps
 * every previous attempt intact.
 */
async function retryAttempt(userId, previousAttemptId) {
  const previous = await Attempt.findById(previousAttemptId);
  if (!previous) {
    throw new AppError("Attempt not found", 404);
  }
  if (previous.userId.toString() !== userId) {
    throw new AppError("Forbidden: this attempt does not belong to you", 403);
  }
  return startAttempt(userId, previous.problemId.toString());
}

async function listAttempts(userId) {
  return Attempt.find({ userId }).populate("problemId", "title slug difficulty").sort({ startedAt: -1 });
}

/**
 * Learner-only attempt lookup. Enforces that the attempt belongs to the
 * requesting user. Do NOT reuse this for admin access -- see
 * evaluationService.getAttemptForAdmin() for the admin-safe equivalent.
 */
async function getAttempt(userId, attemptId) {
  const attempt = await Attempt.findById(attemptId).populate("problemId");
  if (!attempt) {
    throw new AppError("Attempt not found", 404);
  }
  if (attempt.userId.toString() !== userId) {
    throw new AppError("Forbidden: this attempt does not belong to you", 403);
  }
  return attempt;
}

async function saveDraft(userId, attemptId, submission) {
  const attempt = await Attempt.findById(attemptId);
  if (!attempt) {
    throw new AppError("Attempt not found", 404);
  }
  if (attempt.userId.toString() !== userId) {
    throw new AppError("Forbidden: this attempt does not belong to you", 403);
  }
  if (attempt.status !== "IN_PROGRESS") {
    throw new AppError("Only an in-progress attempt can be modified", 400);
  }

  const current = attempt.submission && attempt.submission.toObject ? attempt.submission.toObject() : attempt.submission;
  attempt.submission = { ...current, ...submission };
  await attempt.save();
  return attempt;
}

const REQUIRED_FIELDS = ["assumptions", "requirements", "classes", "relationships", "edgeCases", "tradeOffs"];

async function submitAttempt(userId, attemptId) {
  const attempt = await Attempt.findById(attemptId);
  if (!attempt) {
    throw new AppError("Attempt not found", 404);
  }
  if (attempt.userId.toString() !== userId) {
    throw new AppError("Forbidden: this attempt does not belong to you", 403);
  }
  if (attempt.status !== "IN_PROGRESS") {
    throw new AppError("Attempt has already been submitted", 400);
  }

  for (const field of REQUIRED_FIELDS) {
    if (!attempt.submission[field] || !attempt.submission[field].toString().trim()) {
      throw new AppError(`Field "${field}" cannot be empty before submission`, 400);
    }
  }

  attempt.status = "SUBMITTED";
  attempt.submittedAt = new Date();
  await attempt.save();

  await Evaluation.create({ attemptId: attempt._id, status: "PENDING" });

  return attempt;
}

async function markEvaluating(attemptId) {
  const attempt = await Attempt.findById(attemptId);
  if (!attempt) throw new AppError("Attempt not found", 404);
  if (attempt.status !== "SUBMITTED") {
    throw new AppError("Only submitted attempts can enter evaluation", 400);
  }
  attempt.status = "EVALUATING";
  await attempt.save();
  return attempt;
}

async function markCompleted(attemptId, evaluationId) {
  const attempt = await Attempt.findById(attemptId);
  if (!attempt) throw new AppError("Attempt not found", 404);
  attempt.status = "COMPLETED";
  attempt.completedAt = new Date();
  attempt.evaluationId = evaluationId;
  await attempt.save();
  return attempt;
}

async function markFailed(attemptId) {
  const attempt = await Attempt.findById(attemptId);
  if (!attempt) throw new AppError("Attempt not found", 404);
  // Submission remains stored; only the status changes.
  attempt.status = "FAILED";
  await attempt.save();
  return attempt;
}

async function getPreviousAttemptFocus(userId, problemId) {
  const lastCompleted = await Attempt.findOne({ userId, problemId, status: "COMPLETED" })
    .sort({ completedAt: -1 })
    .populate("evaluationId");
  if (!lastCompleted || !lastCompleted.evaluationId) return null;
  const evaluation = lastCompleted.evaluationId;
  return {
    attemptNumber: lastCompleted.attemptNumber,
    score: evaluation.totalScore,
    nextAttemptFocus: evaluation.nextAttemptFocus,
  };
}

module.exports = {
  startAttempt,
  retryAttempt,
  listAttempts,
  getAttempt,
  saveDraft,
  submitAttempt,
  markEvaluating,
  markCompleted,
  markFailed,
  getPreviousAttemptFocus,
};
