const express = require("express");
const cors = require("cors");

const { env } = require("./config/env");

const authRoutes = require("./routes/auth.routes");
const problemRoutes = require("./routes/problem.routes");
const attemptRoutes = require("./routes/attempt.routes");
const evaluationRoutes = require("./routes/evaluation.routes");
const adminRoutes = require("./routes/admin.routes");

const {
  errorHandler,
  notFoundHandler,
} = require("./middleware/error.middleware");

function createApp() {
  const app = express();

  // ----------------------------------------------------
  // CORS
  // ----------------------------------------------------

  const configuredOrigins = ["http://localhost:5173", ...(env.clientUrls || [])]
    .map((url) => url.trim().replace(/\/+$/, ""))
    .filter(Boolean);

  console.log("[cors] configured origins:", configuredOrigins);

  const isAllowedOrigin = (origin) => {
    // Requests without Origin
    if (!origin) {
      return true;
    }

    const normalizedOrigin = origin.trim().replace(/\/+$/, "");

    // Exact configured origins
    if (configuredOrigins.includes(normalizedOrigin)) {
      return true;
    }

    // Allow Vercel frontend deployments
    const isVercelFrontend =
      /^https:\/\/lld-practice-platform(?:-[a-zA-Z0-9-]+)?\.vercel\.app$/.test(
        normalizedOrigin,
      );

    return isVercelFrontend;
  };

  app.use(
    cors({
      origin: (origin, callback) => {
        console.log("[cors] request origin:", origin || "NO_ORIGIN");

        if (isAllowedOrigin(origin)) {
          console.log("[cors] allowed:", origin || "NO_ORIGIN");

          return callback(null, true);
        }

        console.log("[cors] blocked:", origin);

        return callback(new Error(`Not allowed by CORS: ${origin}`));
      },

      // JWT is sent through Authorization header,
      // so cookies are not required.
      credentials: false,

      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

      allowedHeaders: ["Content-Type", "Authorization"],

      optionsSuccessStatus: 204,
    }),
  );

  // ----------------------------------------------------
  // BODY PARSER
  // ----------------------------------------------------

  app.use(express.json());

  // ----------------------------------------------------
  // HEALTH CHECK
  // ----------------------------------------------------

  app.get("/api/health", (_req, res) => {
    res.status(200).json({
      success: true,
      message: "ok",
    });
  });

  // ----------------------------------------------------
  // API ROUTES
  // ----------------------------------------------------

  app.use("/api/auth", authRoutes);
  app.use("/api/problems", problemRoutes);
  app.use("/api/attempts", attemptRoutes);
  app.use("/api/evaluations", evaluationRoutes);
  app.use("/api/admin", adminRoutes);

  // ----------------------------------------------------
  // ERROR HANDLING
  // ----------------------------------------------------

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
