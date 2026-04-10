import { applyMempoolStrategyV2 } from "../core/mempool_engine_v2.js";

console.log("=== MEMPOOL ENGINE V2 PROBE START ===");

async function run() {
  const candidates = [
    { protectedProfit: 0.002, mevModel: { mevBand: "LOW" } },
    { protectedProfit: 0.003, mevModel: { mevBand: "MEDIUM" } },
    { protectedProfit: 0.001, mevModel: { mevBand: "HIGH" } },
    { protectedProfit: -0.001, mevModel: { mevBand: "LOW" } }
  ];

  const res = applyMempoolStrategyV2(candidates, { urgency: 0.8 });

  console.log("MEMPOOL DECISIONS V2:");
  console.log(res);
}

run().catch(e => {
  console.error("FATAL:", e.message);
});
