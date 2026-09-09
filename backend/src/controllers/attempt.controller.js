const { z } = require("zod");
const attemptService = require("../services/attempt.service");

const startSchema = z.object({ problemId: z.string().min(1) });

async function startAttemptHandler(req, res, next) {
  try {
    const { problemId } = startSchema.parse(req.body);
    const attempt = await attemptService.startAttempt(req.user.id, problemId);
    const focus = await attemptService.getPreviousAttemptFocus(req.user.id, problemId);
    res.status(201).json({ success: true, data: { attempt, previousFocus: focus } });
  } catch (err) {
    next(err);
  }
}

async function listAttemptsHandler(req, res, next) {
  try {
    const attempts = await attemptService.listAttempts(req.user.id);
    res.json({ success: true, data: attempts });
  } catch (err) {
    next(err);
  }
}

async function getAttemptHandler(req, res, next) {
  try {
    const attempt = await attemptService.getAttempt(req.user.id, req.params.id);
    res.json({ success: true, data: attempt });
  } catch (err) {
    next(err);
  }
}

const submissionSchema = z.object({
  assumptions: z.string().optional(),
  requirements: z.string().optional(),
  classes: z.string().optional(),
  relationships: z.string().optional(),
  designPatterns: z.string().optional(),
  edgeCases: z.string().optional(),
  tradeOffs: z.string().optional(),
  pseudocode: z.string().optional(),
});

async function updateAttemptHandler(req, res, next) {
  try {
    const submission = submissionSchema.parse(req.body);
    const attempt = await attemptService.saveDraft(req.user.id, req.params.id, submission);
    res.json({ success: true, data: attempt });
  } catch (err) {
    next(err);
  }
}

async function submitAttemptHandler(req, res, next) {
  try {
    const attempt = await attemptService.submitAttempt(req.user.id, req.params.id);
    res.json({ success: true, data: attempt });
  } catch (err) {
    next(err);
  }
}

async function retryAttemptHandler(req, res, next) {
  try {
    const attempt = await attemptService.retryAttempt(req.user.id, req.params.id);
    res.status(201).json({ success: true, data: { attempt } });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  startAttemptHandler,
  listAttemptsHandler,
  getAttemptHandler,
  updateAttemptHandler,
  submitAttemptHandler,
  retryAttemptHandler,
};
