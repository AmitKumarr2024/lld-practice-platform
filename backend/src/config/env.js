const dotenv = require("dotenv");

dotenv.config();

const clientUrlRaw = process.env.CLIENT_URL || "http://localhost:5173";

const clientUrls = clientUrlRaw
  .split(",")
  .map((url) => url.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const env = {
  // MongoDB
  mongoUri: process.env.MONGODB_URI,

  // JWT
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-me",

  // Server
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,

  // Frontend
  clientUrl: clientUrls[0],
  clientUrls,

  // Environment
  nodeEnv: process.env.NODE_ENV || "development",
};

// Safe logs — NEVER print actual secrets.
console.log("[env] NODE_ENV:", env.nodeEnv);

console.log("[env] CLIENT_URL:", env.clientUrls);

console.log("[env] MONGODB_URI:", env.mongoUri ? "SET" : "MISSING");

console.log("[env] JWT_SECRET:", env.jwtSecret ? "SET" : "MISSING");

module.exports = { env };
