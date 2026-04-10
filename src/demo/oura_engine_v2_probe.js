import { ouraVerdictV2 } from "../core/oura_engine_v2.js";

console.log("=== OURA ENGINE V2 PROBE START ===");

async function run() {
  const sample = {
    protectedProfit: 0.002,
    size: 1,
    weakestDepth: 5000,
    mevModel: { mevRiskScore: 0.05 },
    executionGuard: { allow: true },
    gasModel: { gasEth: 0.0001 }
  };

  const res = ouraVerdictV2(sample);

  console.log("OURA V2 RESULT:");
  console.log(res);
}

run().catch((e) => {
  console.error("FATAL:", e.message);
});
