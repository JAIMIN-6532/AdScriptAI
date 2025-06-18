import kafka from "../config/kafkaClient.js";

const paymentTokenProducer = kafka.producer();
let producerConnected = false;

async function connectProducer() {
  try {
    await paymentTokenProducer.connect();
    producerConnected = true;
    console.log("✅ Kafka paymentTokenProducer connected");
  } catch (error) {
    console.error("❌ Kafka paymentTokenProducer connection error:", error);
  }
}

async function disconnectProducer() {
  try {
    await paymentTokenProducer.disconnect();
    producerConnected = false;
    console.log("🔌 Kafka paymentTokenProducer disconnected");
  } catch (error) {
    console.error("❌ Kafka paymentTokenProducer disconnection error:", error);
  }
}

export default async function publishTokensAfterPayment(event) {
  try {
    console.log("🌟 Publishing paymentTokenProducer tokens:",event);

    // Ensure producer is connected
    if (!producerConnected) {
      console.warn(
        "⚠️ Kafka paymentTokenProducer not connected, attempting to connect..."
      );
      await connectProducer();
    }

    // Publish the message
    await producer.send({
      topic: "payment.tokens", //import topic from .env
      messages: [{ key: event.requestId, value: JSON.stringify(event) }],
    });
    console.log(
      "✅ paymentTokenProducer tokens published successfully:",
      event
    );
  } catch (error) {
    console.error(
      "❌ Error publishing paymentTokenProducer tokens to Kafka:",
      error
    );
    throw error;
  }
}

export { connectProducer, disconnectProducer };
