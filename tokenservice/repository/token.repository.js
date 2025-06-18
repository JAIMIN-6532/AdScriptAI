import TokenModel from "../model/token.model.js";

export default class TokenRepository {
  async addInitialTokens(userId, requestId) {
    const createTokenEntry = await TokenModel.create({
      userId: userId,
      remainingBalance: 50, // Initial tokens
      transaction: [
        {
          type: "initial",
          amount: 50,
          source: "system", // Initial tokens added from purchase
        },
      ],
    });
    return {
      requestId,
      userId,
      status: "ok",
      remainingBalance: createTokenEntry.remainingBalance,
      tokensAdded: 50,
      timestamp: new Date().toISOString(),
    };
  }

  async checkAndDeductTokens(userId, adType, requestId, source) {
    // 1) Fetch current balance:
    const lastTx = await TokenModel.findOne({ userId });
    const currentBalance = lastTx ? lastTx.remainingBalance : 0;

    let responsePayload;

    // 2) Calculate tokens needed based on adType
    let tokensNeeded;
    switch (adType) {
      case "image":
        tokensNeeded = 10; // Dummy script generation
        break;
      case "script":
        tokensNeeded = 20; // AI script generation
        break;
      case "video":
        tokensNeeded = 30; // Premium script generation
        break;
      default:
        throw new Error("Invalid adType provided");
    }

    if (currentBalance >= tokensNeeded) {
      // 2) Deduct tokens
      const newBalance = currentBalance - tokensNeeded;
      const updatedData = await TokenModel.findOneAndUpdate(
        { userId },
        {
          $push: {
            transaction: {
              type: "deduction",
              amount: tokensNeeded,
              source,
            },
          },
          remainingBalance: newBalance,
        },
        { new: true, upsert: true } // Create if not exists
      ).exec();

      responsePayload = {
        requestId,
        userId,
        status: "ok",
        remainingBalance: newBalance,
        tokensDeducted: tokensNeeded,
        timestamp: new Date().toISOString(),
      };
    } else {
      // 3) Insufficient tokens
      responsePayload = {
        requestId,
        userId,
        status: "insufficient_tokens",
        remainingBalance: currentBalance,
        tokensDeducted: 0,
        timestamp: new Date().toISOString(),
      };
    }
    return responsePayload;
  }

  /**
   * Check if a paymentId has already been processed for idempotency
   */
  async isProcessed(paymentId) {
    const existingTx = await TokenModel.findOne({
      "transaction.sourceId": paymentId,
    }).exec();
    return !!existingTx;
  }

  /**
   * Credit tokens to a user and record the transaction
   */
  async creditTokens(userId, tokensToCredit, metadata = {}) {
    const { requestId, paymentId, orderId } = metadata;
    // Update the user's token document
    const updated = await TokenModel.findOneAndUpdate(
      { userId },
      {
        $inc: { remainingBalance: tokensToCredit },
        $push: {
          transaction: {
            type: "addition",
            amount: tokensToCredit,
            source: "purchase",
            sourceId: paymentId,
            orderId: orderId,
            requestId: requestId,
          },
        },
      },
      { new: true, upsert: true }
    ).exec();

    return {
      requestId,
      userId,
      status: "ok",
      remainingBalance: updated.remainingBalance,
      tokensAdded: tokensToCredit,
      timestamp: new Date().toISOString(),
    };
  }

  async getUserTokens(userId) {
    const userTokens = await TokenModel.findOne({ userId }).exec();
    if (!userTokens) {
      throw new Error("User tokens not found");
    }
    return {
      userId,
      remainingBalance: userTokens.remainingBalance,
      transaction: userTokens.transaction,
    };
  }


}
