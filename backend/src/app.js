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

  /*
   * ----------------------------------------------------
   * CORS
   * ----------------------------------------------------
   */

  const allowedOrigins = ["http://localhost:5173", ...env.clientUrls]
    .map((url) => url.trim().replace(/\/+$/, ""))
    .filter(Boolean);

  console.log("[cors] allowed origins:", allowedOrigins);

  const corsOptions = {
    origin: (origin, callback) => {
      // Requests without Origin:
      // Postman, curl, server-to-server, etc.
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.trim().replace(/\/+$/, "");

      // Exact configured frontend URL
      if (allowedOrigins.includes(normalizedOrigin)) {
        console.log("[cors] allowed origin:", normalizedOrigin);

        return callback(null, true);
      }

      // Allow Vercel deployments for this frontend project
      if (
        /^https:\/\/lld-practice-platform(?:-[a-zA-Z0-9-]+)?\.vercel\.app$/.test(
          normalizedOrigin,
        )
      ) {
        console.log("[cors] allowed Vercel origin:", normalizedOrigin);

        return callback(null, true);
      }

      console.log("[cors] blocked origin:", normalizedOrigin);

      return callback(new Error(`Not allowed by CORS: ${normalizedOrigin}`));
    },

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    allowedHeaders: ["Content-Type", "Authorization"],

    optionsSuccessStatus: 204,
  };

  app.use(cors(corsOptions));

  /*
   * Explicit OPTIONS handler.
   * This makes preflight behavior clear.
   */
  app.options(/.*/, cors(corsOptions));

  /*
   * ----------------------------------------------------
   * BODY PARSER
   * ----------------------------------------------------
   */

  app.use(express.json());

  /*
   * ----------------------------------------------------
   * HEALTH
   * ----------------------------------------------------
   */

  app.get("/api/health", (_req, res) => {
    res.status(200).json({
      success: true,
      message: "ok",
    });
  });

  /*
   * ----------------------------------------------------
   * ROUTES
   * ----------------------------------------------------
   */

  app.use("/api/auth", authRoutes);

  app.use("/api/problems", problemRoutes);

  app.use("/api/attempts", attemptRoutes);

  app.use("/api/evaluations", evaluationRoutes);

  app.use("/api/admin", adminRoutes);

  /*
   * ----------------------------------------------------
   * ERROR HANDLING
   * ----------------------------------------------------
   */

  app.use(notFoundHandler);

  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
