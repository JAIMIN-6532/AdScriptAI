import UserModel from "../model/user.model.js";
export default class UserRepository {
  async register(userData) {
    try {
      // Check if user already exists
      const existingUser = await this.getUserByEmail(userData.email);
      if (existingUser) {
        throw new Error("User already exists with this email");
      }
      const user = new UserModel(userData);
      return await user.save();
    } catch (error) {
      throw error; // so the controller can catch and handle it
    }
  }

  async getUserByEmail(email) {
    try {
      const user = await UserModel.findOne({ email });
      return user;
    } catch (error) {
      throw error;
    }
  }

  async getUserById(userId) {
    try {
      const user = await UserModel.findById(userId).select("-password");
      return user;
    } catch (error) {
      throw error;
    }
  }

  async getAllUsers() {
    try {
      const users = await UserModel.find().select("-password");
      return users;
    } catch (error) {
      throw error;
    }
  }
}
