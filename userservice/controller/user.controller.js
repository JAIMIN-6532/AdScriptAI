import UserRepository from "../repository/user.repository.js";
import { sendToken } from "../utils/sendToken.js";
import { ErrorHandler } from "../utils/ErrorHandler.js";
import sendWelcomeEmail from "../utils/email/sendWelcomeEmail.js";
import  publishTokenInitially  from "../kafka/producer.js";
import {v4 as uuidv4} from "uuid";

export default class UserController {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(req, res, next) {
    const { name, email, password } = req.body;
    try {
      const newUser = await this.userRepository.register(req.body);
      if (!newUser) {
        return next(new ErrorHandler(400, "User registration failed"));
      }
      // Remove password before sending the response
      newUser.password = undefined; // Remove password from user object

      // Implement sendWelcomeEmail function to send welcome message
      // await sendWelcomeEmail(newUser);/////////////////////////////
      const requestId = uuidv4(); // Generate a unique request ID
      //publish initial tokens
      await publishTokenInitially({ requestId,userId: newUser._id });

      await sendToken(newUser, res, 200);

      return;
    } catch (err) {
      return next(new ErrorHandler(400, err));
    }
  }

  async signIn(req, res, next) {
    const { email, password } = req.body;
    try {
      const user = await this.userRepository.getUserByEmail(email);
      if (!user) {
        return next(new ErrorHandler(404, "User not found"));
      }

      // Check if password matches
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return next(new ErrorHandler(401, "Invalid credentials"));
      }

      user.password = undefined; // Remove password from user object

      await sendToken(user, res, 200);
    } catch (err) {
      return next(
        new ErrorHandler(500, err.message || "Internal server error")
      );
    }
  }

  async getProfile(req, res, next) {
    try {
      const userId = req.params.id;
      const user = await this.userRepository.getUserById(req.userID || userId);
      if (!user) {
        return next(new ErrorHandler(404, "User not found"));
      }
      res.status(200).json({ success: true, user });
    } catch (err) {
      return next(
        new ErrorHandler(500, err.message || "Internal server error")
      );
    }
  }

  async logout(req, res, next) {
    try {
      res.clearCookie("token");
      // Clear the Authorization header
      res.setHeader("Authorization", "");
      res
        .status(200)
        .json({ success: true, message: "Logged out successfully" });
    } catch (err) {
      return next(
        new ErrorHandler(500, err.message || "Internal server error")
      );
    }
  }

  async getAllUsers(req, res, next) {
    try{
      // const userId = req.userID;
      // // If user is not admin, restrict access
      // if (!userId || !req.isAdmin) {
      //   return next(new ErrorHandler(403, "Access denied"));
      // }

      const users = await this.userRepository.getAllUsers();
      if (!users || users.length === 0) {
        return next(new ErrorHandler(404, "No users found"));
      }
      res.status(200).json({ success: true, users });
    }catch (err) {
      return next(
        new ErrorHandler(500, err.message || "Internal server error")
      );
    }
  
  }
}
