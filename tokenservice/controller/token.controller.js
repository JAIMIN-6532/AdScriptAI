import TokenRepository from "../repository/token.repository.js";
import { ErrorHandler } from "../utils/ErrorHandler.js";
export default class TokenController {
  constructor() {
    this.tokenRepository = new TokenRepository();
  }

  getUserTokens = async (req, res, next) => {
    try {
      const userId = req.userID;
      const tokensDetails = await this.tokenRepository.getUserTokens(userId);
      res.status(200).json({
        success: true,
        message: "Tokens retrieved successfully",
        tokensDetails: tokensDetails,
      });
    } catch (error) {
      next(new ErrorHandler(500, error.message || "Internal server error"));
    }
  };
}
