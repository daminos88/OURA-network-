import { runHybridOrchestrator } from "../core/hybrid_orchestrator.js";

const RPC = "https://arb-mainnet.g.alchemy.com/v2/HHLjeTEA3XMBAwEIwHzmy";

console.log("=== HYBRID ORCHESTRATOR PROBE START ===");

async function run() {
  const res = await runHybridOrchestrator({ rpcUrl: RPC });

  console.log("SCANNER:", res.scan?.best);
  console.log("DIVERGENCE:", res.divergence?.bestEdge);
  console.log("OURA:", res.oura);
  console.log("GOVERNANCE:", res.governance);
}

run().catch(e => {
  console.error("FATAL:", e.message);
  process.exit(1);
});
