const { Router } = require("express");
const { requireAuth } = require("../middleware/auth.middleware");
const {
  startAttemptHandler,
  listAttemptsHandler,
  getAttemptHandler,
  updateAttemptHandler,
  submitAttemptHandler,
  retryAttemptHandler,
} = require("../controllers/attempt.controller");

const router = Router();
router.use(requireAuth);
router.post("/", startAttemptHandler);
router.get("/", listAttemptsHandler);
router.get("/:id", getAttemptHandler);
router.put("/:id", updateAttemptHandler);
router.post("/:id/submit", submitAttemptHandler);
router.post("/:id/retry", retryAttemptHandler);

module.exports = router;
