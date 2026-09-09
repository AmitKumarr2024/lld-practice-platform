const { setupTestDb, teardownTestDb, clearTestDb } = require("./setup");
const { Problem } = require("../models/Problem");
const problemService = require("../services/problem.service");

describe("Problem service", () => {
  beforeAll(setupTestDb);
  afterAll(teardownTestDb);
  beforeEach(clearTestDb);

  it("fetches a valid problem by id", async () => {
    const problem = await Problem.create({
      title: "Parking Lot",
      slug: "parking-lot",
      description: "desc",
      difficulty: "MEDIUM",
      problemStatement: "statement",
      requirements: ["r1"],
      constraints: ["c1"],
      active: true,
    });

    const fetched = await problemService.getProblemById(problem._id.toString());
    expect(fetched.title).toBe("Parking Lot");
  });

  it("throws for an invalid problem id", async () => {
    const fakeId = "64b64b64b64b64b64b64b64b";
    await expect(problemService.getProblemById(fakeId)).rejects.toThrow("Problem not found");
  });
});
