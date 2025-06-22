import express from "express";
import dotenv from "dotenv";
dotenv.config();
import {
  errorHandlerMiddleware,
  handleUncaughtError,
} from "./middleware/errorHandlerMiddleware.js";
import userRouter from "./routes/user.routes.js";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/mongoConfig.js";
import loggerMiddleware from "./middleware/logger.middleware.js";
import { ErrorHandler } from "./utils/ErrorHandler.js";
import logger from "./utils/logger.js";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(loggerMiddleware);

app.use("/", loggerMiddleware, userRouter);

// Handle uncaught exceptions
app.use((req, res, next) => {
  logger.warn(`Route not found error: ${req.method} ${req.originalUrl} not found`);
  next(
    new ErrorHandler(404, "Route not found. Please check the URL or endpoint.")
  );
});

// errorHandlerMiddleware
app.use(errorHandlerMiddleware);

app.listen(process.env.PORT, () => {
  // console.log(`userService is running on port ${process.env.PORT}`);
  logger.info(`UserService is running on port ${process.env.PORT}`);
  connectDB();
});

export default app;
