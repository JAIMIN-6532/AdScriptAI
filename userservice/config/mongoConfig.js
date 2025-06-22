import mongoose from "mongoose";
import logger from "../utils/logger.js";
import dotenv from "dotenv";
dotenv.config();


export const connectDB = async () => {
  try {
    logger.info("Connecting to MongoDB...");
    // console.log("db connecting...");
    const res = await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info("MongoDB connected successfully");
    // console.log(`mongodb connected with server ${res.connection.host}`);
  } catch (error) {
    logger.error("MongoDB connection failed:", error);
    // console.log("mongodb connection failed!");
    // console.log(error);
  }
};