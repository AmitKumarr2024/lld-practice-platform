const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models/User");
const { env } = require("../config/env");
const { AppError } = require("../middleware/error.middleware");

async function login(email, password) {
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new AppError("Invalid email or password", 401);
  }
  const token = jwt.sign(
    { id: user._id.toString(), role: user.role, name: user.name, email: user.email },
    env.jwtSecret,
    { expiresIn: "7d" }
  );
  return {
    token,
    user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role },
  };
}

async function register(name, email, password, role = "LEARNER") {
  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    throw new AppError("Email is already registered", 409);
  }
  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({ name, email: email.toLowerCase().trim(), passwordHash, role });
  return login(email, password);
}

module.exports = { login, register };
