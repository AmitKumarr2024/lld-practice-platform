const { setupTestDb, teardownTestDb, clearTestDb } = require("./setup");
const { Problem } = require("../models/Problem");
const { User } = require("../models/User");
const attemptService = require("../services/attempt.service");

async function makeProblemAndUser() {
  const problem = await Problem.create({
    title: "Vending Machine",
    slug: "vending-machine",
    description: "desc",
    difficulty: "EASY",
    problemStatement: "statement",
    requirements: ["r1"],
    constraints: [],
    active: true,
  });
  const user = await User.create({
    name: "Learner",
    email: "l@test.com",
    passwordHash: "hash",
    role: "LEARNER",
  });
  return { problem, user };
}

const fullSubmission = {
  assumptions: "a",
  requirements: "r",
  classes: "c",
  relationships: "rel",
  edgeCases: "e",
  tradeOffs: "t",
};

describe("Attempt service", () => {
  beforeAll(setupTestDb);
  afterAll(teardownTestDb);
  beforeEach(clearTestDb);

  it("learner can start an attempt, and it starts as IN_PROGRESS", async () => {
    const { problem, user } = await makeProblemAndUser();
    const attempt = await attemptService.startAttempt(user._id.toString(), problem._id.toString());
    expect(attempt.status).toBe("IN_PROGRESS");
    expect(attempt.attemptNumber).toBe(1);
  });

  it("learner can save a draft", async () => {
    const { problem, user } = await makeProblemAndUser();
    const attempt = await attemptService.startAttempt(user._id.toString(), problem._id.toString());
    const updated = await attemptService.saveDraft(user._id.toString(), attempt._id.toString(), {
      assumptions: "my assumption",
    });
    expect(updated.submission.assumptions).toBe("my assumption");
  });

  it("learner can submit a complete attempt", async () => {
    const { problem, user } = await makeProblemAndUser();
    const attempt = await attemptService.startAttempt(user._id.toString(), problem._id.toString());
    await attemptService.saveDraft(user._id.toString(), attempt._id.toString(), fullSubmission);
    const submitted = await attemptService.submitAttempt(user._id.toString(), attempt._id.toString());
    expect(submitted.status).toBe("SUBMITTED");
    expect(submitted.submittedAt).toBeTruthy();
  });

  it("rejects submission with missing required fields", async () => {
    const { problem, user } = await makeProblemAndUser();
    const attempt = await attemptService.startAttempt(user._id.toString(), problem._id.toString());
    await expect(attemptService.submitAttempt(user._id.toString(), attempt._id.toString())).rejects.toThrow();
  });

  it("submitted attempt cannot be submitted again", async () => {
    const { problem, user } = await makeProblemAndUser();
    const attempt = await attemptService.startAttempt(user._id.toString(), problem._id.toString());
    await attemptService.saveDraft(user._id.toString(), attempt._id.toString(), fullSubmission);
    await attemptService.submitAttempt(user._id.toString(), attempt._id.toString());
    await expect(attemptService.submitAttempt(user._id.toString(), attempt._id.toString())).rejects.toThrow(
      "Attempt has already been submitted"
    );
  });

  it("submitted attempt cannot be modified", async () => {
    const { problem, user } = await makeProblemAndUser();
    const attempt = await attemptService.startAttempt(user._id.toString(), problem._id.toString());
    await attemptService.saveDraft(user._id.toString(), attempt._id.toString(), fullSubmission);
    await attemptService.submitAttempt(user._id.toString(), attempt._id.toString());
    await expect(
      attemptService.saveDraft(user._id.toString(), attempt._id.toString(), { assumptions: "changed" })
    ).rejects.toThrow("Only an in-progress attempt can be modified");
  });

  it("retry creates a new attempt and the previous attempt remains unchanged", async () => {
    const { problem, user } = await makeProblemAndUser();
    const attempt1 = await attemptService.startAttempt(user._id.toString(), problem._id.toString());
    await attemptService.saveDraft(user._id.toString(), attempt1._id.toString(), fullSubmission);
    await attemptService.submitAttempt(user._id.toString(), attempt1._id.toString());

    const attempt2 = await attemptService.startAttempt(user._id.toString(), problem._id.toString());
    expect(attempt2.attemptNumber).toBe(2);
    expect(attempt2._id.toString()).not.toBe(attempt1._id.toString());

    const reloadedAttempt1 = await attemptService.getAttempt(user._id.toString(), attempt1._id.toString());
    expect(reloadedAttempt1.status).toBe("SUBMITTED");
    expect(reloadedAttempt1.submission.assumptions).toBe("a");
  });

  it("the dedicated retry endpoint also increments attempt number without touching the original", async () => {
    const { problem, user } = await makeProblemAndUser();
    const attempt1 = await attemptService.startAttempt(user._id.toString(), problem._id.toString());
    await attemptService.saveDraft(user._id.toString(), attempt1._id.toString(), fullSubmission);
    await attemptService.submitAttempt(user._id.toString(), attempt1._id.toString());

    const attempt2 = await attemptService.retryAttempt(user._id.toString(), attempt1._id.toString());
    expect(attempt2.attemptNumber).toBe(2);
    expect(attempt2.status).toBe("IN_PROGRESS");

    const reloadedAttempt1 = await attemptService.getAttempt(user._id.toString(), attempt1._id.toString());
    expect(reloadedAttempt1.status).toBe("SUBMITTED");
  });

  it("a learner cannot access another learner's attempt", async () => {
    const { problem, user } = await makeProblemAndUser();
    const attempt = await attemptService.startAttempt(user._id.toString(), problem._id.toString());

    const otherUser = await User.create({
      name: "Other Learner",
      email: "other@test.com",
      passwordHash: "hash",
      role: "LEARNER",
    });

    await expect(attemptService.getAttempt(otherUser._id.toString(), attempt._id.toString())).rejects.toThrow(
      "Forbidden"
    );
    await expect(
      attemptService.saveDraft(otherUser._id.toString(), attempt._id.toString(), { assumptions: "hijacked" })
    ).rejects.toThrow("Forbidden");
  });
});
