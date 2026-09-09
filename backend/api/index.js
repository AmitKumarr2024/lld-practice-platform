// Vercel serverless entry point. Wraps the same Express app used for local
// dev (src/app.js) -- no route/logic duplication. vercel.json rewrites every
// request to this function, so req.url keeps the original path (e.g.
// /api/auth/login), which matches the app's own /api/* route mounts.
const { createApp } = require("../src/app");
const { connectDatabase } = require("../src/config/database");

const app = createApp();

module.exports = async (req, res) => {
  // Let the health check respond without requiring a DB connection, so it
  // can be used to verify the deployment itself is reachable.
  if (req.url === "/api/health") {
    return app(req, res);
  }
  try {
    await connectDatabase();
  } catch (err) {
    console.error("[api] database connection failed:", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ success: false, message: "Database connection failed" }));
    return;
  }
  return app(req, res);
};
