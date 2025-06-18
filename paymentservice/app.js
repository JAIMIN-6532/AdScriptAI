import express from "express";
import dotenv from "dotenv";
dotenv.config();
import {
  errorHandlerMiddleware,
  handleUncaughtError,
} from "./middleware/errorHandlerMiddleware.js";
import paymentRouter from "./routes/payment.routes.js";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/mongoConfig.js";
import loggerMiddleware from "./middleware/logger.middleware.js";
import ErrorHandler from "./utils/ErrorHandler.js";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(loggerMiddleware);

app.use("/", loggerMiddleware, paymentRouter);

// Handle uncaught exceptions
app.use((req, res, next) => {
  next(
    new ErrorHandler(404, "Route not found. Please check the URL or endpoint.")
  );
});

// errorHandlerMiddleware
app.use(errorHandlerMiddleware);

app.listen(process.env.PORT, () => {
  console.log(`Payment Service is running on port ${process.env.PORT}`);
  connectDB();

  //Make Your Kafka Consumer later and Add it on here.
});

export default app;
