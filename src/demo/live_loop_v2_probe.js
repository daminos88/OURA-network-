import { runLiveLoopV2 } from "../core/live_loop_v2.js";

const RPC = "https://arb-mainnet.g.alchemy.com/v2/HHLjeTEA3XMBAwEIwHzmy";

console.log("=== LIVE LOOP V2 (RESERVE-AWARE) PROBE START ===");

async function run() {
  const res = await runLiveLoopV2({
    rpcUrl: RPC,
    cycles: 3,
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

  console.log("RESULTS:", res.results);
  console.log("SUMMARY:", res.summary);
}

run().catch(e => {
  console.error("FATAL:", e.message);
});
