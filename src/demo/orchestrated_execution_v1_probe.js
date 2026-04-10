import { runOrchestratedExecutionV1 } from "../core/orchestrated_execution_v1.js";

console.log("=== ORCHESTRATED EXECUTION V1 PROBE START ===");

async function run() {
  const res = await runOrchestratedExecutionV1({
    rpcUrl: "http://localhost:8545",
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

  console.log("ORCHESTRATED RESULT:");
  console.log({
    ok: res.ok,
    winner: Boolean(res.winner),
    finalCandidates: Array.isArray(res.finalCandidates) ? res.finalCandidates.length : 0
  });
}

run().catch((e) => {
  console.error("FATAL:", e.message);
});
