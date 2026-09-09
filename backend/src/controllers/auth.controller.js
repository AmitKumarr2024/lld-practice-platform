const { z } = require("zod");
const authService = require("../services/auth.service");

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

async function loginHandler(req, res, next) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const result = await authService.login(email, password);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

async function registerHandler(req, res, next) {
  try {
    const { name, email, password } = registerSchema.parse(req.body);
    const result = await authService.register(name, email, password, "LEARNER");
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function meHandler(req, res) {
  res.json({ success: true, data: req.user });
}

module.exports = { loginHandler, registerHandler, meHandler };
