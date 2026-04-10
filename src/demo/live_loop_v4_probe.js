import { runLiveLoopV4 } from "../core/live_loop_v4.js";

console.log("=== LIVE LOOP V4 PROBE START ===");

async function run() {
  const res = await runLiveLoopV4({
    rpcUrl: "http://localhost:8545",
    cycles: 3,
    riskConfig: {},
    reserveConfig: {},
    executionConfig: {
      gasUnits: 250000,
      gasPriceGwei: 0.1,
      priorityFeeGwei: 0.01,
      urgency: 0.8,
      chainId: 42161
    }
  });

  console.log("LIVE LOOP V4 RESULT:");
  console.log(res);
}

run().catch((e) => {
  console.error("FATAL:", e.message);
});
