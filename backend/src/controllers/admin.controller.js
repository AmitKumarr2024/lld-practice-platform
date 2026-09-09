const evaluationService = require("../services/evaluation.service");

async function listAdminAttemptsHandler(req, res, next) {
  try {
    const attempts = await evaluationService.listAllAdminAttempts();
    res.json({ success: true, data: attempts });
  } catch (err) {
    next(err);
  }
}

async function listPendingReviewsHandler(req, res, next) {
  try {
    const attempts = await evaluationService.listPendingAttempts();
    res.json({ success: true, data: attempts });
  } catch (err) {
    next(err);
  }
}

async function listCompletedReviewsHandler(req, res, next) {
  try {
    const attempts = await evaluationService.listCompletedAttempts();
    res.json({ success: true, data: attempts });
  } catch (err) {
    next(err);
  }
}

async function getAdminAttemptHandler(req, res, next) {
  try {
    const attempt = await evaluationService.getAttemptForAdmin(req.params.id);
    res.json({ success: true, data: attempt });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listAdminAttemptsHandler,
  listPendingReviewsHandler,
  listCompletedReviewsHandler,
  getAdminAttemptHandler,
};
