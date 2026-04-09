import { runHybridOrchestratorV2 } from "../core/hybrid_orchestrator_v2.js";

const RPC = "https://arb-mainnet.g.alchemy.com/v2/HHLjeTEA3XMBAwEIwHzmy";

console.log("=== HYBRID ORCHESTRATOR V2 PROBE START ===");

async function run() {
  const res = await runHybridOrchestratorV2({ rpcUrl: RPC });

  console.log("WINNER:", res.winner);
  console.log("RANKED:", res.ranked);
  console.log("OURA:", res.oura);
  console.log("GOVERNANCE:", res.governance);
}

run().catch(e => {
  console.error("FATAL:", e.message);
});
