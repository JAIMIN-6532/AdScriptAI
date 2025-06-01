// services/checkTokensConsumer.js
import kafka from "../config/kafkaClient.js";
import TokenRepository from "../repository/token.repository.js";

const consumerB = kafka.consumer({ groupId: "token-service-group" });
const tokenRepository = new TokenRepository();

export async function startCheckTokensConsumer() {
  try {
    await consumerB.connect();
    console.log("✅ Kafka consumer B (check-tokens) connected");

    await consumerB.subscribe({
      topic: "adscript.requests",
      fromBeginning: false,
    });
    console.log("🔔 Consumer B subscribed to adscript.requests");

    await consumerB.run({
      eachMessage: async ({ message }) => {
        try {
          const payload = JSON.parse(message.value.toString());
          console.log("🔑 [B] Received TokenCheckRequest:", payload);

          const { requestId, userId, adType, source } = payload;
          const responsePayload = await tokenRepository.checkAndDeductTokens(
            userId,
            adType,
            requestId,
            source
          );

          const producer = kafka.producer();
          await producer.connect();
          console.log("📤 [B] Publishing TokenCheckResponse:", responsePayload);

          await producer.send({
            topic: "adscript.tokens",
            messages: [
              {
                key: requestId,
                value: JSON.stringify(responsePayload),
              },
            ],
          });
          console.log("✅ [B] TokenCheckResponse published:", requestId);

          await producer.disconnect();
        } catch (error) {
          console.error("❌ [B] Error processing TokenCheckRequest:", error);
        }
      },
    });
  } catch (error) {
    console.error("❌ [B] Consumer error:", error);
    process.exit(1);
  }
}
