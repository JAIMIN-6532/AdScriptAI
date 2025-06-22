import { ErrorHandler } from "../utils/ErrorHandler.js";
import logger from "../utils/logger.js";

export const errorHandlerMiddleware = (err, req, res, next) => {
  err.message = err.message || "Internal server error";
  err.statusCode = err.statusCode || 500;
  // Log the error with structured context
  logger.error("[HTTP Error]", {
    route: `${req.method} ${req.originalUrl}`,
    statusCode,
    message,
    stack: err.stack,
    userId: req.userID,
    requestId: req.requestId,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  res.status(err.statusCode).json({ success: false, error: err.message });
};

// handling handleUncaughtError  Rejection
export const handleUncaughtError = () => {
  process.on("uncaughtException", (err) => {
    logger.error("Uncaught Exception:", {
      message: err.message,
      stack: err.stack,
    });
    console.log("shutting down server bcz of uncaughtException");
  });
};
