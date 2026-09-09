const dotenv = require("dotenv");
dotenv.config();

// CLIENT_URL may be a single origin or a comma-separated list (e.g. a
// production frontend URL plus Vercel preview-deployment URLs).
const clientUrlRaw = process.env.CLIENT_URL || "http://localhost:5173";
const clientUrls = clientUrlRaw
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const env = {
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-me",
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  clientUrl: clientUrls[0],
  clientUrls,
  nodeEnv: process.env.NODE_ENV || "development",
};

module.exports = { env };
