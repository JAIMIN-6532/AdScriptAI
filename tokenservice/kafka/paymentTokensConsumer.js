import kafka from "../config/kafkaClient.js";
import TokenRepository from "../repository/token.repository.js";
import dotenv from "dotenv";
dotenv.config(); // ensure environment variables are loaded


const consumerC = kafka.consumer({ groupId: "payment-tokens-group" });
const tokenRepository = new TokenRepository();

// 1 INR = 1 token
const TOKEN_RATE = process.env.TOKEN_RATE;

export async function startPaymentTokensConsumer() {
  try {
    await consumerC.connect();
    console.log("✅ Kafka consumer C connected");

    await consumerC.subscribe({
      topic: "payment.tokens",
      fromBeginning: true,
    });
    console.log("🔔 Consumer C subscribed to payment.tokens");

    await consumerC.run({
      eachMessage: async ({ message }) => {
        try {
          const payload = JSON.parse(message.value.toString());
          console.log("📩 [C] Received payment-tokens payload:", payload);

          const { userId, requestId, paymentId, orderId, amount } = payload;

          // 1. Idempotency: skip if already processed
          const alreadyProcessed = await tokenRepository.isProcessed(paymentId);
          if (alreadyProcessed) {
            console.log(`↩️ [C] Skipping already-processed paymentId=${paymentId}`);
            return;
          }

          // 2. Convert amount (in paise) to tokens: paise/100 = INR, then * TOKEN_RATE
          const tokensToCredit = Math.floor(amount / 100) * TOKEN_RATE;

          // 3. Credit tokens to user
          await tokenRepository.creditTokens(
            userId,
            tokensToCredit,
            { requestId, paymentId, orderId }
          );
          console.log(`✅ [C] Credited ${tokensToCredit} tokens to user ${userId}`);

        } catch (error) {
          console.error("❌ [C] Error processing payment-tokens event:", error);
          // optionally implement retry or DLQ logic here
        }
      },
    });
  } catch (error) {
    console.error("❌ [C] Consumer error:", error);
    process.exit(1);
  }
}
