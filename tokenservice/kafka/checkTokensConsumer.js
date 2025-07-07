import kafka from "../config/kafkaClient.js";
import TokenRepository from "../repository/token.repository.js";

const consumerB = kafka.consumer({ groupId: "token-service-group" });
const tokenResponseProducer = kafka.producer();

export async function startCheckTokensConsumer() {
  try {
    // 1) Connect the “B” consumer once at startup:
    await consumerB.connect();
    console.log("✅ Kafka consumer B (token-service) connected");

    // 2) Subscribe to “adscript.requests” (only new messages: fromBeginning: false)
    await consumerB.subscribe({
      topic: "adscript.requests",
      fromBeginning: false,
    });
    console.log("🔔 Consumer B subscribed to 'adscript.requests'");

    // 3) Connect a single “response” producer (for adscript.tokens):
    await tokenResponseProducer.connect();
    console.log("✅ tokenResponseProducer connected");

    // 4) Start the “B” consumer loop:
    await consumerB.run({
      eachMessage: async ({ message }) => {
        try {
          const payload = JSON.parse(message.value.toString());
          console.log("🔑 [B] Received TokenCheckRequest:", payload);

          const { requestId, userId, adType, source } = payload;

          // 5) Perform your token check / deduct logic:
          const responsePayload = await new TokenRepository().checkAndDeductTokens(
            userId,
            adType,
            requestId,
            source
          );

          console.log("📤 [B] Publishing TokenCheckResponse:", responsePayload);

          // 6) Publish exactly one reply to “adscript.tokens” with the same key:
          await tokenResponseProducer.send({
            topic: "adscript.tokens",
            messages: [
              {
                key: requestId,
                value: JSON.stringify(responsePayload),
              },
            ],
          });
          console.log("✅ [B] TokenCheckResponse published:", requestId);
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
