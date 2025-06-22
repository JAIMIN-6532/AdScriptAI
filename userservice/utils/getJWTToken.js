import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const getJWTToken = (user) => {
  // 1. Read the secret key from environment variables.
  const secretKey = process.env.JWT_SECRET;

  // 2. Create a payload with userID.
  const payload = {
    userID: user._id,
    role: user.role,
  };
  // 3. Generate the JWT token.
  const token = jwt.sign(payload, secretKey, {
    expiresIn: process.env.JWT_Expire || "1h", // Default to 1 hour if not set
  });

  return token;
};
