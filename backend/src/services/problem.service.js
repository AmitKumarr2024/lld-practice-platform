const { Problem } = require("../models/Problem");
const { AppError } = require("../middleware/error.middleware");

async function listProblems() {
  return Problem.find({ active: true }).sort({ title: 1 });
}

async function getProblemById(id) {
  const problem = await Problem.findById(id);
  if (!problem) {
    throw new AppError("Problem not found", 404);
  }
  return problem;
}

module.exports = { listProblems, getProblemById };
