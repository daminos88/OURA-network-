import { applyNonceReservation } from "../core/nonce_engine_v1.js";

console.log("=== NONCE ENGINE V1 PROBE START ===");

async function run() {
  const candidates = [
    { id: "A" },
    { id: "B" },
    { id: "C" }
  ];

  const state = {
    chainNonce: 10,
    localNonce: 10,
    pendingCount: 0
  };

  const res = applyNonceReservation(candidates, state);

  console.log("NONCE ASSIGNMENT:");
  console.log(res);
}

run().catch(e => {
  console.error("FATAL:", e.message);
});
