import { runLiveLoopV3 } from "../core/live_loop_v3.js";

console.log("=== LIVE LOOP V3 PROBE START ===");

async function run() {
  const res = await runLiveLoopV3({
    rpcUrl: "http://localhost:8545",
    cycles: 3,
    riskConfig: {},
    reserveConfig: {}
  });

  console.log("LIVE LOOP V3 RESULT:");
  console.log(res);
}

run().catch((e) => {
  console.error("FATAL:", e.message);
});
