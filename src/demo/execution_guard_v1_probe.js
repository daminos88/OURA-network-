import { applyExecutionGuard } from "../core/execution_guard_v1.js";

console.log("=== EXECUTION GUARD V1 PROBE START ===");

async function run() {
  const candidates = [
    {
      protectedProfit: 0.002,
      mevModel: { mevBand: "LOW" },
      liquidityAllow: true
    },
    {
      protectedProfit: -0.001,
      mevModel: { mevBand: "HIGH" },
      liquidityAllow: true
    }
  ];

  const context = {
    governanceAction: "ESCALATE_TO_SEAL",
    nonceConsistent: true
  };

  const res = applyExecutionGuard(candidates, context);

  console.log("EXECUTION GUARD RESULT:");
  console.log(res);
}

run().catch(e => {
  console.error("FATAL:", e.message);
});
