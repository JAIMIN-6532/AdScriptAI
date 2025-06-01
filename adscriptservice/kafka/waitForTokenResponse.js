// kafka/waitForTokenResponse.js
import kafka from "../config/kafkaClient.js";

export default async function waitForTokenResponse(requestId, timeoutMs = 10000) {
  if (!requestId) {
    throw new Error("waitForTokenResponse requires a non‐empty requestId");
  }

  const consumer = kafka.consumer({ groupId: `waiter-${requestId}` });
  let timerHandle;

  return new Promise(async (resolve, reject) => {
    try {
      await consumer.connect();

      // <--- Change here: read from the beginning so you won't miss an already‐published reply:
      await consumer.subscribe({
        topic: "adscript.tokens",
        fromBeginning: true,
      });

      // If no matching reply arrives within timeoutMs, give up
      timerHandle = setTimeout(async () => {
        await consumer.disconnect();
        reject(new Error("Token response timeout"));
      }, timeoutMs);

      await consumer.run({
        eachMessage: async ({ message }) => {
          const key = message.key.toString();
          if (key !== requestId) return; // skip other keys

          // Found our reply
          clearTimeout(timerHandle);
          const payload = JSON.parse(message.value.toString());
          await consumer.disconnect();
          resolve(payload);
        },
      });
    } catch (err) {
      clearTimeout(timerHandle);
      try { await consumer.disconnect(); } catch (_) {}
      reject(err);
    }
  });
}
