const { Router } = require("express");
const { requireAuth } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");
const {
  listAdminAttemptsHandler,
  listPendingReviewsHandler,
  listCompletedReviewsHandler,
  getAdminAttemptHandler,
} = require("../controllers/admin.controller");

const router = Router();
router.use(requireAuth, requireRole("ADMIN"));
router.get("/attempts", listAdminAttemptsHandler);
router.get("/attempts/:id", getAdminAttemptHandler);
router.get("/reviews/pending", listPendingReviewsHandler);
router.get("/reviews/completed", listCompletedReviewsHandler);

module.exports = router;
