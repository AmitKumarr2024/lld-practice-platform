const { Router } = require("express");
const { requireAuth } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");
const { getEvaluationHandler, submitEvaluationHandler } = require("../controllers/evaluation.controller");

const router = Router();
router.use(requireAuth);
router.get("/:attemptId", getEvaluationHandler);
router.post("/:attemptId", requireRole("ADMIN"), submitEvaluationHandler);

module.exports = router;
