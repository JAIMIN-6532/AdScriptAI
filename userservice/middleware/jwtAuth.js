import jwt from "jsonwebtoken";
import { ErrorHandler } from "../utils/ErrorHandler.js";
import dotenv from "dotenv";
dotenv.config();
export const jwtAuth = (req, res, next) => {
  // 1. Read the token.
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  // 2. if no token, return the error.
  if (!token) {
    return res.status(401).send("Unauthorized");
  }
  // 3. check if token is valid.
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userID = payload.userID;
    req.user = payload;
  } catch (err) {
    // 4. return error.
    console.log(err);
    return next(new ErrorHandler(401, err.message || "Invalid token"));
  }
  // 5. call next middleware
  next();
};

export const authByUserRole = (...roles) => {
  return async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          403,
          `Role: ${req.user.role} is not allowed to access this resource`
        )
      );
    }
    next();
  };
};
