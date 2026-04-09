import { runGoldenPathV2 } from "../core/golden_path_v2.js";

const RPC = "https://arb-mainnet.g.alchemy.com/v2/HHLjeTEA3XMBAwEIwHzmy";

console.log("=== GOLDEN PATH V2 PROBE START ===");

async function run() {
  const res = await runGoldenPathV2({
    rpcUrl: RPC,
    riskConfig: {
      maxSize: 0.01,
      maxHops: 4,
      minRealNet: 0,
      minScore: 0,
      maxExposure: 0.02,
      currentExposure: 0
    },
    reserveConfig: {
      minWeakestDepth: 100,
      minLiquidityScore: 1
    }
  });

  console.log("WINNER:", res.winner);
  console.log("RESERVE FILTERED:", res.reserveApplied);
  console.log("TX PLAN:", res.txPlan);
}

run().catch(e => {
  console.error("FATAL:", e.message);
});
