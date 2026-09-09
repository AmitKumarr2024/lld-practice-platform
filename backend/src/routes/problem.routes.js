const { Router } = require("express");
const { listProblemsHandler, getProblemHandler } = require("../controllers/problem.controller");

const router = Router();
router.get("/", listProblemsHandler);
router.get("/:id", getProblemHandler);

module.exports = router;
