import UserModel from "../model/user.model.js";
export default class UserRepository {
  async register(userData) {
    try {
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
}
