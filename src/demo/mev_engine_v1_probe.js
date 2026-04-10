import { rerankByProtectedProfit } from "../core/mev_engine_v1.js";

console.log("=== MEV ENGINE V1 PROBE START ===");

async function run() {
  const candidates = [
    {
      size: 0.001,
      weakestDepth: 500,
      path: ["WETH", "USDC"],
      slippageModel: { totalPenalty: 0.00005 },
      trueExecutableProfit: 0.002
    },
    {
      size: 0.001,
      weakestDepth: 50,
      path: ["WETH", "USDT", "USDC"],
      slippageModel: { totalPenalty: 0.0002 },
      trueExecutableProfit: 0.003
    }
  ];

  const res = rerankByProtectedProfit(candidates, {
    gasPriceGwei: 0.1,
    priorityFeeGwei: 0.01
  });

  console.log("PROTECTED RANKING:");
  console.log(res);
}

run().catch(e => {
  console.error("FATAL:", e.message);
});
