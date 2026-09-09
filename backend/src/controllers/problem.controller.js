const problemService = require("../services/problem.service");

async function listProblemsHandler(req, res, next) {
  try {
    const problems = await problemService.listProblems();
    res.json({ success: true, data: problems });
  } catch (err) {
    next(err);
  }
}

async function getProblemHandler(req, res, next) {
  try {
    const problem = await problemService.getProblemById(req.params.id);
    res.json({ success: true, data: problem });
  } catch (err) {
    next(err);
  }
}

module.exports = { listProblemsHandler, getProblemHandler };
