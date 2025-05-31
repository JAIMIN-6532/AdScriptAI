import UserRepository from "../repository/user.repository.js";
import { sendToken } from "../utils/sendToken.js";
import { ErrorHandler } from "../utils/ErrorHandler.js";
import sendWelcomeEmail from "../utils/email/sendWelcomeEmail.js";

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
      await sendWelcomeEmail(newUser);

      await sendToken(newUser, res, 200);

      return ;
    } catch (err) {
      //  handle error for duplicate email
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
}
