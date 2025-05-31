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

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(loggerMiddleware);

app.use("/api/v1/users", loggerMiddleware , userRouter);

// Handle uncaught exceptions
app.use((req, res, next) => {
  next(new ErrorHandler(404, "Route not found. Please check the URL or endpoint."));
});

// errorHandlerMiddleware
app.use(errorHandlerMiddleware);

app.listen(process.env.PORT, () => {
  console.log(`userService is running on port ${process.env.PORT}`);
  connectDB();
});

export default app;
