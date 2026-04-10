import { runLiveLoop } from "../core/live_loop.js";

const RPC = "https://arb-mainnet.g.alchemy.com/v2/HHLjeTEA3XMBAwEIwHzmy";

console.log("=== LIVE LOOP (GOLDEN PATH) PROBE START ===");

async function run() {
  const res = await runLiveLoop({
    rpcUrl: RPC,
    cycles: 3,
    riskConfig: {
      maxSize: 0.01,
      maxHops: 4,
      minRealNet: 0,
      minScore: 0,
      maxExposure: 0.02,
      currentExposure: 0
    }
  });

  console.log("RESULTS:", res.results);
  console.log("SUMMARY:", res.summary);
}

run().catch(e => {
  console.error("FATAL:", e.message);
});
