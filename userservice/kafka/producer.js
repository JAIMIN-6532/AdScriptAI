import kafka from "../config/kafkaClient.js";
import logger from "../utils/logger.js";

const producer = kafka.producer();
let producerConnected = false;

async function connectProducer() {
  try {
    await producer.connect();
    producerConnected = true;
    logger.info("Kafka producer connected successfully");
    // console.log(" Kafka producer connected");
  } catch (error) {
    logger.error("Kafka producer connection error:", error);
    // console.error(" Kafka producer connection error:", error);
  }
}

async function disconnectProducer() {
  try {
    await producer.disconnect();
    producerConnected = false;
    logger.info("Kafka producer disconnected successfully");
    // console.log(" Kafka producer disconnected");
  } catch (error) {
    logger.error("Kafka producer disconnection error:", error);
    // console.error("Kafka producer disconnection error:", error);
  }
}

export default async function publishTokenInitially(event) {
  try {
    // console.log(" Publishing initial tokens:", event);
    logger.info("Publishing initial tokens:", event);
    // Ensure producer is connected
    if (!producerConnected) {
      logger.warn("Kafka producer not connected, attempting to connect...");
      // console.warn(" Kafka producer not connected, attempting to connect...");
      await connectProducer();
    }

    // Publish the message
    await producer.send({
      topic: "user.tokens", //import topic from .env
      messages: [{ key: event.requestId, value: JSON.stringify(event) }],
    });
    logger.info("Initial tokens published successfully:", event);
    // console.log(" Initial tokens published successfully:", event);
  } catch (error) {
    logger.error("Error publishing initial tokens to Kafka:", error);
    // console.error("Error publishing initial tokens to Kafka:", error);
    throw error;
  }
}

export { connectProducer, disconnectProducer };
