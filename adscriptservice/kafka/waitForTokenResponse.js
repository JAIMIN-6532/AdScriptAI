// // kafka/waitForTokenResponse.js
// import kafka from "../config/kafkaClient.js";

// export default async function waitForTokenResponse(requestId, timeoutMs = 10000) {
//   if (!requestId) {
//     throw new Error("waitForTokenResponse requires a non‐empty requestId");
//   }

//   const consumer = kafka.consumer({ groupId: `waiter-${requestId}` });
//   let timerHandle;

//   return new Promise(async (resolve, reject) => {
//     try {
//       await consumer.connect();

//       // <--- Change here: read from the beginning so you won't miss an already‐published reply:
//       await consumer.subscribe({
//         topic: "adscript.tokens",
//         fromBeginning: true,
//       });

//       // If no matching reply arrives within timeoutMs, give up
//       timerHandle = setTimeout(async () => {
//         await consumer.disconnect();
//         reject(new Error("Token response timeout"));
//       }, timeoutMs);

//       await consumer.run({
//         eachMessage: async ({ message }) => {
//           const key = message.key.toString();
//           if (key !== requestId) return; // skip other keys

//           // Found our reply
//           clearTimeout(timerHandle);
//           const payload = JSON.parse(message.value.toString());
//           await consumer.disconnect();
//           resolve(payload);
//         },
//       });
//     } catch (err) {
//       clearTimeout(timerHandle);
//       try { await consumer.disconnect(); } catch (_) {}
//       reject(err);
//     }
//   });
// }


// kafka/waitForTokenResponse.js

import kafka from "../config/kafkaClient.js";

/**
 * This module keeps a single, shared consumer (groupId = “token-waiter-group”)
 * that is started as soon as this file is imported. Internally, it maintains
 * a Map<requestId → { resolve, reject, timer }> so that each HTTP request
 * can simply do:
 *
 *    const responsePayload = await waitForTokenResponse(requestId, timeoutMs);
 *
 * and the consumer’s eachMessage() will look up the matching resolver,
 * clear its timeout, and resolve that promise.
 */

const pendingRequests = new Map(); // requestId → { resolve, reject, timer }

const replyConsumer = kafka.consumer({ groupId: "token-waiter-group" });

// ─── Immediately start the “reply” consumer at module load ────────────────────
async function startReplyConsumer() {
  try {
    await replyConsumer.connect();
    console.log("✅ replyConsumer connected (groupId = 'token-waiter-group')");

    // We only care about new replies going forward; fromBeginning: false
    await replyConsumer.subscribe({
      topic: "adscript.tokens",
      fromBeginning: false,
    });
    console.log("🔔 replyConsumer subscribed to 'adscript.tokens'");

    await replyConsumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const key = message.key.toString();       // this is requestId
        const raw = message.value.toString();     // the token‐check response JSON

        if (!pendingRequests.has(key)) {
          // Either we already timed out, or no one is waiting on this key.
          return;
        }

        const { resolve, reject, timer } = pendingRequests.get(key);
        clearTimeout(timer);
        pendingRequests.delete(key);

        let payload;
        try {
          payload = JSON.parse(raw);
        } catch (err) {
          // If JSON is malformed, we still call resolve or reject—
          // here we choose to resolve with an error object.
          return resolve({ error: "Invalid JSON in token response" });
        }

        // Resolve the promise so that the waiting HTTP route can continue:
        resolve(payload);
      },
    });
  } catch (err) {
    console.error("❌ Error starting replyConsumer:", err);
    process.exit(1);
  }
}

// Start the consumer as soon as this file is imported:
startReplyConsumer();

/**
 * Returns a Promise that resolves when a matching token response arrives,
 * or rejects after `timeoutMs`.
 *
 * @param {string} requestId – must match the key used in adscript.requests/​tokens
 * @param {number} [timeoutMs=10000]
 * @returns {Promise<object>}
 */
export default function waitForTokenResponse(requestId, timeoutMs = 10000) {
  if (!requestId) {
    return Promise.reject(new Error("waitForTokenResponse requires a non-empty requestId"));
  }

  return new Promise((resolve, reject) => {
    // 1) Schedule a timeout to reject if no reply arrives in time
    const timer = setTimeout(() => {
      pendingRequests.delete(requestId);
      reject(new Error("Token response timeout"));
    }, timeoutMs);

    // 2) Store this resolver in the map, so the consumer’s eachMessage() can find it
    pendingRequests.set(requestId, { resolve, reject, timer });
  });
}
