require("dotenv").config();
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const app = express();

// ─── 1) ENVIRONMENT AND SERVICE URLS ──────────────────────────────────────────
const PORT = process.env.PORT || 3000;

const USER_SERVICE_URL =
  process.env.USER_SERVICE_URL || "http://localhost:3001";
const ADSCRIPT_SERVICE_URL =
  process.env.ADSCRIPT_SERVICE_URL || "http://localhost:3002";
const TOKEN_SERVICE_URL =
  process.env.TOKEN_SERVICE_URL || "http://localhost:3003";

// ─── 2) GLOBAL MIDDLEWARE ─────────────────────────────────────────
// Security headers
app.use(helmet());

// CORS (adjust `ALLOWED_ORIGINS` in your .env as comma-separated list, or "*" for any origin)
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["*"];
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Simple request logging
app.use(
  morgan(":method :url → :status :res[content-length] - :response-time ms")
);

// Rate limiter: max 100 requests per minute per IP
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/v1/", apiLimiter);

// ─── 3) HEALTH-CHECK ENDPOINTS ────────────────────────────────────────────────
// Liveness probe
app.get("/healthz/live", (req, res) => {
  res.sendStatus(200);
});

// Readiness probe: check that each downstream service responds within 200ms
const axios = require("axios");
app.get("/healthz/ready", async (req, res) => {
  try {
    await Promise.all([
      axios.head(`${USER_SERVICE_URL}/healthz`, { timeout: 200 }),
      axios.head(`${ADSCRIPT_SERVICE_URL}/healthz`, { timeout: 200 }),
      axios.head(`${TOKEN_SERVICE_URL}/healthz`, { timeout: 200 }),
    ]);
    res.sendStatus(200);
  } catch (err) {
    res.sendStatus(503);
  }
});



// ─── 4) PROXY HELPERS ───────────────────────────────────────────────────────────
/**
 * Wraps a createProxyMiddleware instance in a circuit-breaker-like pattern.
 * If the downstream service is returning >=500 or timing out, it quickly fails with a 503.
 */
function makeProxy(pathPrefix, targetUrl) {
  return createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    pathRewrite: { [`^${pathPrefix}`]: "" },
    timeout: 30_000, // how long the gateway waits for the downstream response means 30 seconds
    proxyTimeout: 30_000,
    onError(err, req, res) {
      console.error(
        `❌ Proxy error: ${req.method} ${req.originalUrl} → ${targetUrl}`,
        err.message
      );
      if (!res.headersSent) {
        res.status(502).json({ error: "Upstream service unavailable." });
      }
    },
  });
}

// ─── 5) MOUNT GATEWAY ROUTES ────────────────────────────────────────────────────

// 5a) All "/api/v1/users/*" → userService (prefix stripped)
app.use("/api/v1/users", makeProxy("/api/v1/users", USER_SERVICE_URL));

// 5b) All "/api/v1/adscript/*" → adscriptService
app.use(
  "/api/v1/adscript",
  makeProxy("/api/v1/adscript", ADSCRIPT_SERVICE_URL)
);

// 5c) All "/api/v1/token/*" → tokenService
app.use("/api/v1/token", makeProxy("/api/v1/token", TOKEN_SERVICE_URL));

// ─── 6) CATCH-ALL 404 FOR UNKNOWN ROUTES ───────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// ─── 7) GLOBAL ERROR HANDLER (in case anything else throws) ────────────────────
app.use((err, req, res, next) => {
  console.error("❌ Unhandled Gateway Error:", err);
  if (!res.headersSent) {
    res.status(500).json({ error: "Gateway internal error" });
  }
});

// ─── 8) START LISTENING ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on http://localhost:${PORT}`);
});
