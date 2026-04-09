import { runGoldenPath } from "../core/golden_path.js";

const RPC = "https://arb-mainnet.g.alchemy.com/v2/HHLjeTEA3XMBAwEIwHzmy";

console.log("=== GOLDEN PATH PROBE START ===");

async function run() {
  const res = await runGoldenPath({
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
  console.log("EXECUTION:", res.execution);
  console.log("TX PLAN:", res.txPlan);
  console.log("LEDGER:", res.ledger);
}

run().catch(e => {
  console.error("FATAL:", e.message);
});
