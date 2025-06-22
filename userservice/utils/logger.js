import winston from "winston";
import "winston-daily-rotate-file";

const { combine, timestamp, printf, json, colorize } = winston.format;

// Custom log format for console
const consoleFormat = combine(
  colorize(),
  timestamp(),
  printf(({ level, message, timestamp, ...meta }) => {
    const metaString = Object.keys(meta).length
      ? JSON.stringify(meta)
      : "";
    return `[${timestamp}] ${level}: ${message} ${metaString}`;
  })
);

// JSON format for files
const fileFormat = combine(timestamp(), json());

const transports = [
  new winston.transports.Console({
    format: consoleFormat,
    level: process.env.LOG_LEVEL || "info",
  }),
  // daily rotate file transport
  new winston.transports.DailyRotateFile({
    filename: "logs/application-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d",
    format: fileFormat,
    level: "info",
  }),
  new winston.transports.DailyRotateFile({
    filename: "logs/errors-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "10m",
    maxFiles: "30d",
    level: "error",
    format: fileFormat,
  }),
];

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  transports,
  exitOnError: false,
});

// catch unhandled exceptions & rejections
logger.exceptions.handle(
  new winston.transports.DailyRotateFile({
    filename: "logs/exceptions-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "10m",
    maxFiles: "30d",
    format: fileFormat,
  })
);
process.on("unhandledRejection", (ex) => {
  throw ex;
});

export default logger;