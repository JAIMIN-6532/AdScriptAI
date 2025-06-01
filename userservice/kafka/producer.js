
// import kafka from "../config/kafkaClient.js";

// const producer = kafka.producer();
// export async function publishTokenInitially(event) {
//   try {
//     console.log(
//       "Publishing tokens inititally to Kafka topic: user.tokens",
//       event
//     );
//     await producer.connect();
//     console.log("Connected to Kafka producer");
//     await producer.send({
//       topic: "user.tokens",
//       messages: [{ key: event.requestId, value: JSON.stringify(event) }],
//     });
//     console.log("initial tokens published successfully:", event);
//     await producer.disconnect();
//     console.log("Disconnected from Kafka producer");
//   } catch (error) {
//     console.error("Error publishing initial tokens to Kafka:", error);
//     throw error;
//   }
// }
import kafka from "../config/kafkaClient.js";

const producer = kafka.producer();
let producerConnected = false;

async function connectProducer() {
  try {
    await producer.connect();
    producerConnected = true;
    console.log("✅ Kafka producer connected");
  } catch (error) {
    console.error("❌ Kafka producer connection error:", error);
  }
}

async function disconnectProducer() {
  try {
    await producer.disconnect();
    producerConnected = false;
    console.log("🔌 Kafka producer disconnected");
  } catch (error) {
    console.error("❌ Kafka producer disconnection error:", error);
  }
}

export default async function publishTokenInitially(event) {
  try {
    console.log("🌟 Publishing initial tokens:", event);

    // Ensure producer is connected
    if (!producerConnected) {
      console.warn("⚠️ Kafka producer not connected, attempting to connect...");
      await connectProducer();
    }

    // Publish the message
    await producer.send({
      topic: "user.tokens",   //import topic from .env
      messages: [{ key: event.requestId, value: JSON.stringify(event) }],
    });
    console.log("✅ Initial tokens published successfully:", event);
  } catch (error) {
    console.error("❌ Error publishing initial tokens to Kafka:", error);
    throw error;
  }
}

export { connectProducer, disconnectProducer };
