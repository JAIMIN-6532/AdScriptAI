import kafka from "../config/kafkaClient.js";

//  Create one long-lived producer instance 
export const adRequestProducer = kafka.producer();

// Call this once (e.g. at app startup) to connect your producer.
// After that, every publishAdRequest() call will reuse the same connection.
export async function connectProducer() {
  await adRequestProducer.connect();
  console.log("✅ adRequestProducer connected");
}

export async function disconnectProducer() {
  await adRequestProducer.disconnect();
  console.log("🛑 adRequestProducer disconnected");
}

// ─── Instead of connecting/disconnecting per message, we now simply send on the already-connected producer:
export async function publishAdRequest(event) {
  try {
    console.log("📨 Publishing ad request to Kafka topic 'adscript.requests':", event);
    await adRequestProducer.send({
      topic: "adscript.requests",
      messages: [
        {
          key: event.requestId,
          value: JSON.stringify(event),
        },
      ],
    });
    console.log("✅ Ad request published successfully:", event.requestId);
  } catch (error) {
    console.error("❌ Error publishing ad request to Kafka:", error);
    throw error;
  }
}
