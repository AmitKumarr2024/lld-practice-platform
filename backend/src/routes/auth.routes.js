const { Router } = require("express");
const { loginHandler, registerHandler, meHandler } = require("../controllers/auth.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = Router();
router.post("/login", loginHandler);
router.post("/register", registerHandler);
router.get("/me", requireAuth, meHandler);

module.exports = router;
