// import express from "express";
// import dotenv from "dotenv";
// dotenv.config();
// import {
//   errorHandlerMiddleware,
//   handleUncaughtError,
// } from "./middleware/errorHandlerMiddleware.js";
// import cookieParser from "cookie-parser";
// import { connectDB } from "./config/mongoConfig.js";
// import loggerMiddleware from "./middleware/logger.middleware.js";
// import { jwtAuth } from "./middleware/jwtAuth.js";
// import tokenRouter from "./routes/token.routes.js";
// import { startCheckTokensConsumer } from "./kafka/checkTokensConsumer.js";
// import { startInitialTokensConsumer } from "./kafka/initTokenConsumer.js";

// const app = express();
// app.use(express.json());
// app.use(cookieParser());
// app.use(loggerMiddleware);

// app.use("/", loggerMiddleware, tokenRouter);

// // Handle uncaught exceptions
// app.use((req, res, next) => {
//   next(
//     new errorHandlerMiddleware(
//       404,
//       "Route not found. Please check the URL or endpoint."
//     )
//   );
// });

// // errorHandlerMiddleware
// app.use(errorHandlerMiddleware);

// app.listen(process.env.PORT, () => {
//   console.log(`tokenService is running on port ${process.env.PORT}`);
//   connectDB();
//   startInitialTokensConsumer().catch((err) => {
//     console.error("❌ Failed to start InitialTokensConsumer:", err);
//     process.exit(1);
//   });

//   startCheckTokensConsumer().catch((err) => {
//     console.error("❌ Failed to start CheckTokensConsumer:", err);
//     process.exit(1);
//   });
// });

// export default app;


// app.js (TokenService)

import express from "express";
import dotenv from "dotenv";
dotenv.config();

import cookieParser from "cookie-parser";
import { connectDB } from "./config/mongoConfig.js";
import loggerMiddleware from "./middleware/logger.middleware.js";
import {
  errorHandlerMiddleware,
  handleUncaughtError,
} from "./middleware/errorHandlerMiddleware.js";

import { jwtAuth } from "./middleware/jwtAuth.js";
import tokenRouter from "./routes/token.routes.js";

// ─── Kafka consumers for initialization & token checks ───────────────────────
import { startCheckTokensConsumer } from "./kafka/checkTokensConsumer.js";
import { startInitialTokensConsumer } from "./kafka/initTokenConsumer.js";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(loggerMiddleware);

// Only allow authenticated routes (if desired); adjust as needed:
app.use("/", loggerMiddleware, jwtAuth, tokenRouter);

// Catch‐all for undefined routes
app.use((req, res, next) => {
  next(
    new errorHandlerMiddleware(
      404,
      "Route not found. Please check the URL or endpoint."
    )
  );
});

// Error‐handling middleware
app.use(errorHandlerMiddleware);

// ─── Wrap server startup in an async function ─────────────────────────────────
async function startTokenService() {
  // 1) Connect to MongoDB first
  try {
    await connectDB();
    console.log("✅ MongoDB connected (TokenService)");
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB (TokenService):", err);
    process.exit(1);
  }

  // 2) Start any “initial tokens” consumer if you need to seed tokens at startup:
  try {
    await startInitialTokensConsumer();
    console.log("✅ InitialTokensConsumer started");
  } catch (err) {
    console.error("❌ Failed to start InitialTokensConsumer:", err);
    process.exit(1);
  }

  // 3) Start the long‐lived “check‐tokens” consumer:
  try {
    await startCheckTokensConsumer();
    console.log("✅ CheckTokensConsumer started");
  } catch (err) {
    console.error("❌ Failed to start CheckTokensConsumer:", err);
    process.exit(1);
  }

  // 4) All Kafka consumers are now running. Time to start the HTTP server:
  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`🛡 TokenService is running on port ${port}`);
  });
}

startTokenService().catch((err) => {
  console.error("❌ TokenService failed to start:", err);
  process.exit(1);
});

export default app;
