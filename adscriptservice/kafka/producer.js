import kafka from "../config/kafkaClient.js";

const producer = kafka.producer();
export async function publishAdRequest(event) {
  try {
    console.log(
      "Publishing ad request to Kafka topic: adscript.requests",
      event
    );
    await producer.connect();
    console.log("Connected to Kafka producer");
    await producer.send({
      topic: "adscript.requests",
      messages: [{ key: event.requestId, value: JSON.stringify(event) }],
    });
    console.log("Ad request published successfully:", event);
    await producer.disconnect();
    console.log("Disconnected from Kafka producer");
  } catch (error) {
    console.error("Error publishing ad request to Kafka:", error);
    throw error;
  }
}
