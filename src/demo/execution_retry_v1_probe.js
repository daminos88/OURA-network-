import { applyRetryPolicy } from "../core/execution_retry_v1.js";

console.log("=== EXECUTION RETRY V1 PROBE START ===");

async function run() {
  const events = [
    { errorType: "TIMEOUT", attempt: 1 },
    { errorType: "REPLACED", attempt: 1 },
    { errorType: "RELAY_REJECT", attempt: 2 },
    { errorType: "NONCE_CONFLICT", attempt: 1 }
  ];

  const res = applyRetryPolicy(events, {
    maxAttempts: 3,
    baseBackoffMs: 500,
    priorityBumpBps: 500
  });

  console.log("RETRY DECISIONS:");
  console.log(res);
}

run().catch(e => {
  console.error("FATAL:", e.message);
});
