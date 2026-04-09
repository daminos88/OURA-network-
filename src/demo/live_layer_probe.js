import { runLiveLayer } from "../core/live_layer.js";

const RPC = "https://arb-mainnet.g.alchemy.com/v2/HHLjeTEA3XMBAwEIwHzmy";

console.log("=== LIVE LAYER PROBE START ===");

async function run() {
  const res = await runLiveLayer({ rpcUrl: RPC });

  console.log("STATE:", res.state);
  console.log("HYBRID:", res.hybrid?.oura);
  console.log("EXECUTION:", res.execution?.action);
}

run().catch(e => {
  console.error("FATAL:", e.message);
  process.exit(1);
});
