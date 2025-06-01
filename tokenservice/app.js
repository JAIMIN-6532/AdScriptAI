import express from "express";
import dotenv from "dotenv";
dotenv.config();
import {
  errorHandlerMiddleware,
  handleUncaughtError,
} from "./middleware/errorHandlerMiddleware.js";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/mongoConfig.js";
import loggerMiddleware from "./middleware/logger.middleware.js";
import { jwtAuth } from "./middleware/jwtAuth.js";
import tokenRouter from "./routes/token.routes.js";
import { startCheckTokensConsumer } from "./kafka/checkTokensConsumer.js";
import { startInitialTokensConsumer } from "./kafka/initTokenConsumer.js";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(loggerMiddleware);

app.use("/", loggerMiddleware, tokenRouter);

// Handle uncaught exceptions
app.use((req, res, next) => {
  next(
    new errorHandlerMiddleware(
      404,
      "Route not found. Please check the URL or endpoint."
    )
  );
});

// errorHandlerMiddleware
app.use(errorHandlerMiddleware);

app.listen(process.env.PORT, () => {
  console.log(`tokenService is running on port ${process.env.PORT}`);
  connectDB();
  startInitialTokensConsumer().catch((err) => {
    console.error("❌ Failed to start InitialTokensConsumer:", err);
    process.exit(1);
  });

  startCheckTokensConsumer().catch((err) => {
    console.error("❌ Failed to start CheckTokensConsumer:", err);
    process.exit(1);
  });
});

export default app;
