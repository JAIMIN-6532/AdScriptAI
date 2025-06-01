import kafka from "../config/kafkaClient.js";
import TokenRepository from "../repository/token.repository.js";

const consumerA = kafka.consumer({ groupId: "initial-tokens-group" });
const tokenRepository = new TokenRepository();

export async function startInitialTokensConsumer() {
  try {
    await consumerA.connect();
    console.log("✅ Kafka consumer A (initial-tokens) connected");

    await consumerA.subscribe({
      topic: "user.tokens",
      fromBeginning: true,
    });
    console.log("🔔 Consumer A subscribed to user.tokens");

    await consumerA.run({
      eachMessage: async ({ message }) => {
        try {
          const payload = JSON.parse(message.value.toString());
          console.log("📩 [A] Received initial-tokens:", payload);

          const { userId, requestId } = payload;
          const result = await tokenRepository.addInitialTokens(userId, requestId);
          console.log("✅ [A] Tokens added:", result);
        } catch (error) {
          console.error("❌ [A] Error processing initial-tokens:", error);
        }
      },
    });
  } catch (error) {
    console.error("❌ [A] Consumer error:", error);
    process.exit(1);
  }
}
