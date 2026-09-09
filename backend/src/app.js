const express = require("express");
const cors = require("cors");
const { env } = require("./config/env");
const authRoutes = require("./routes/auth.routes");
const problemRoutes = require("./routes/problem.routes");
const attemptRoutes = require("./routes/attempt.routes");
const evaluationRoutes = require("./routes/evaluation.routes");
const adminRoutes = require("./routes/admin.routes");
const { errorHandler, notFoundHandler } = require("./middleware/error.middleware");

function createApp() {
  const app = express();

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow non-browser requests (no Origin header) and any configured origin.
        if (!origin || env.clientUrls.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
    })
  );
  app.use(express.json());

  app.get("/api/health", (_req, res) => res.json({ success: true, message: "ok" }));

  app.use("/api/auth", authRoutes);
  app.use("/api/problems", problemRoutes);
  app.use("/api/attempts", attemptRoutes);
  app.use("/api/evaluations", evaluationRoutes);
  app.use("/api/admin", adminRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
