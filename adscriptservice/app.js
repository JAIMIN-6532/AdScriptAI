import express from "express";
import dotenv from "dotenv";
dotenv.config();

import cookieParser from "cookie-parser";
import { connectDB } from "./config/mongoConfig.js";
import loggerMiddleware from "./middleware/logger.middleware.js";
import adScriptRouter from "./routes/adscript.routes.js";
import {
  errorHandlerMiddleware,
  handleUncaughtError,
} from "./middleware/errorHandlerMiddleware.js";

//  Kafka imports 
import { connectProducer } from "./kafka/producer.js";
// Note: simply importing waitForTokenResponse starts its single “reply” consumer
// (groupId = "token-waiter-group") that subscribes to "adscript.tokens".

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(loggerMiddleware);

// Your existing ad‐script routes (they will internally call publishAdRequest + waitForTokenResponse)
app.use("/", loggerMiddleware, adScriptRouter);

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

//  Wrap server startup in an async function so we can await Kafka + Mongo ───
async function startAdScriptService() {
  // 1) Connect to MongoDB first (so your DB is available inside routes/controllers)
  try {
    await connectDB();
    console.log("✅ MongoDB connected (AdScriptService)");
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB (AdScriptService):", err);
    process.exit(1);
  }

  // 2) Connect the single, long‐lived Kafka producer for ad requests
  try {
    await connectProducer();
    // After this resolves, every call to publishAdRequest(...) will use this connection.
  } catch (err) {
    console.error("❌ Failed to connect Kafka producer (AdScriptService):", err);
    process.exit(1);
  }

  // 3) At this point, waitForTokenResponse's consumer is already “running” (because we imported it above)
  //    It subscribed to "adscript.tokens" from the moment this module was loaded, so it is ready to receive replies.
  //
  //    If you want to verify that consumer is connected, you can add a small log inside
  //    "kafka/waitForTokenResponse.js" when it finishes connecting/subscribing.

  // 4) Now that Mongo and Kafka producer/consumer are all up, start the HTTP server:
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`🚀 AdScriptService is running on port ${port}`);
  });
}

startAdScriptService().catch((err) => {
  console.error("❌ AdScriptService failed to start:", err);
  process.exit(1);
});

export default app;
