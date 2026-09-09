const { setupTestDb, teardownTestDb, clearTestDb } = require("./setup");
const { Problem } = require("../models/Problem");
const { User } = require("../models/User");
const { Attempt } = require("../models/Attempt");
const attemptService = require("../services/attempt.service");
const evaluationService = require("../services/evaluation.service");
const { DEFAULT_RUBRIC } = require("../domain/rubric/Rubric");

const fullSubmission = {
  assumptions: "a",
  requirements: "r",
  classes: "c",
  relationships: "rel",
  edgeCases: "e",
  tradeOffs: "t",
};

function fullValidCriteria(scoreFraction = 1) {
  return DEFAULT_RUBRIC.map((r) => ({
    criterion: r.criterion,
    score: Math.round(r.maxScore * scoreFraction),
    evidence: "evidence",
  }));
}

async function setupSubmittedAttempt() {
  const problem = await Problem.create({
    title: "Parking Lot",
    slug: "parking-lot",
    description: "desc",
    difficulty: "MEDIUM",
    problemStatement: "statement",
    requirements: [],
    constraints: [],
    active: true,
  });
  const learner = await User.create({ name: "Learner", email: "l@test.com", passwordHash: "x", role: "LEARNER" });
  const admin = await User.create({ name: "Admin", email: "a@test.com", passwordHash: "x", role: "ADMIN" });

  const attempt = await attemptService.startAttempt(learner._id.toString(), problem._id.toString());
  await attemptService.saveDraft(learner._id.toString(), attempt._id.toString(), fullSubmission);
  await attemptService.submitAttempt(learner._id.toString(), attempt._id.toString());

  return { problem, learner, admin, attempt };
}

describe("Evaluation service", () => {
  beforeAll(setupTestDb);
  afterAll(teardownTestDb);
  beforeEach(clearTestDb);

  it("admin can evaluate a submitted attempt", async () => {
    const { admin, attempt } = await setupSubmittedAttempt();
    const evaluation = await evaluationService.submitEvaluation(admin._id.toString(), attempt._id.toString(), {
      criteria: fullValidCriteria(0.8),
      strengths: ["Good separation of concerns"],
      improvements: ["Reduce coupling"],
      nextAttemptFocus: ["Introduce a strategy pattern"],
    });
    expect(evaluation.status).toBe("COMPLETED");
    expect(evaluation.totalScore).toBeGreaterThan(0);
  });

  it("score cannot exceed criterion maximum", async () => {
    const { admin, attempt } = await setupSubmittedAttempt();
    const criteria = fullValidCriteria(1);
    criteria[0].score = criteria[0].score + 1000; // exceed max

    await expect(
      evaluationService.submitEvaluation(admin._id.toString(), attempt._id.toString(), { criteria })
    ).rejects.toThrow();

    const reloaded = await Attempt.findById(attempt._id);
    expect(reloaded.status).toBe("FAILED");
    // Submission must never be lost
    expect(reloaded.submission.assumptions).toBe("a");
  });

  it("completed evaluation changes attempt status to COMPLETED", async () => {
    const { admin, attempt } = await setupSubmittedAttempt();
    await evaluationService.submitEvaluation(admin._id.toString(), attempt._id.toString(), {
      criteria: fullValidCriteria(1),
    });
    const reloaded = await Attempt.findById(attempt._id);
    expect(reloaded.status).toBe("COMPLETED");
  });

  it("rejects reviewing an attempt that has already been completed", async () => {
    const { admin, attempt } = await setupSubmittedAttempt();
    await evaluationService.submitEvaluation(admin._id.toString(), attempt._id.toString(), {
      criteria: fullValidCriteria(1),
    });

    await expect(
      evaluationService.submitEvaluation(admin._id.toString(), attempt._id.toString(), {
        criteria: fullValidCriteria(0.5),
      })
    ).rejects.toThrow();
  });

  it("rejects an admin review for a nonexistent attempt", async () => {
    const { admin } = await setupSubmittedAttempt();
    const fakeId = "64b64b64b64b64b64b64b64b";
    await expect(
      evaluationService.submitEvaluation(admin._id.toString(), fakeId, { criteria: fullValidCriteria(1) })
    ).rejects.toThrow("Attempt not found");
  });

  it("evaluation failure does not delete the submission and allows retrying evaluation", async () => {
    const { admin, attempt } = await setupSubmittedAttempt();
    const badCriteria = fullValidCriteria(1);
    badCriteria.pop(); // missing a criterion -> triggers failure

    await expect(
      evaluationService.submitEvaluation(admin._id.toString(), attempt._id.toString(), { criteria: badCriteria })
    ).rejects.toThrow();

    const reloaded = await Attempt.findById(attempt._id);
    expect(reloaded.status).toBe("FAILED");
    expect(reloaded.submission.classes).toBe("c");

    // Admin retries evaluation with correct data
    const evaluation = await evaluationService.submitEvaluation(admin._id.toString(), attempt._id.toString(), {
      criteria: fullValidCriteria(1),
    });
    expect(evaluation.status).toBe("COMPLETED");
  });

  it("admin can view any learner's submission without an ownership error", async () => {
    const { admin, attempt } = await setupSubmittedAttempt();
    const adminView = await evaluationService.getAttemptForAdmin(attempt._id.toString());
    expect(adminView._id.toString()).toBe(attempt._id.toString());
    expect(adminView.submission.assumptions).toBe("a");
  });
});
