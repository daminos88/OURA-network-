import { runHybridOrchestratorV3 } from "../core/hybrid_orchestrator_v3.js";

const RPC = "https://arb-mainnet.g.alchemy.com/v2/HHLjeTEA3XMBAwEIwHzmy";

console.log("=== HYBRID ORCHESTRATOR V3 PROBE START ===");

async function run() {
  const res = await runHybridOrchestratorV3({
    rpcUrl: RPC,
    riskConfig: {
      maxSize: 0.01,
      maxHops: 4,
      minRealNet: 0,
      minScore: 0,
      maxExposure: 0.02,
      currentExposure: 0
    }
  });

  console.log("WINNER:", res.winner);
  console.log("RISK APPLIED:", res.riskApplied);
  console.log("OURA:", res.oura);
  console.log("GOVERNANCE:", res.governance);
}

run().catch(e => {
  console.error("FATAL:", e.message);
});
