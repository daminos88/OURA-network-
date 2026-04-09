import { ouraVerdict } from "../core/oura_engine.js";
import { governanceGate } from "../core/governance/seal_admiral.js";

console.log("=== AXIUM PHASE 4 SIDECAR START ===");

// temporary sidecar signal until live scanner is wired from repo side
const scan = {
  best: {
    venue: "UNISWAP_V2->SUSHISWAP->CAMELOT",
    path: ["WETH", "USDC", "DAI", "WETH"],
    size: 0.0025,
    netEth: 0.00008,
    ethBack: 0.00253
  }
};

async function run() {
  if (!scan.best) {
    console.log("NO SIGNAL");
    return;
  }

  const costs = {
    totalCost: Math.abs((scan.best.size ?? 0) - (scan.best.ethBack ?? 0))
  };

  const verdict = ouraVerdict({
    netEth: scan.best.netEth,
    costs,
    size: scan.best.size
  });

  console.log("OURA:", verdict);

  const gate = governanceGate({
    signal: {
      venue: scan.best.venue,
      path: scan.best.path,
      size: scan.best.size,
      netEth: scan.best.netEth,
      realNet: scan.best.netEth - costs.totalCost
    },
    oura: verdict,
    metadata: { source: "pulse_phase4" }
  });

  console.log("GOVERNANCE:", gate);

  if (verdict.decision !== "ACCEPT") {
    console.log("BLOCKED BY OURA");
    console.log(`reason=${verdict.reason}`);
    console.log(`venue=${scan.best.venue}`);
    console.log(`path=${scan.best.path.join("->")}`);
    console.log(`size=${scan.best.size}`);
    return;
  }

  if (gate.action !== "ESCALATE_TO_SEAL") {
    console.log("BLOCKED BY GOVERNANCE");
    return;
  }

  console.log("ESCALATED TO SEAL / ADMIRAL");
}

run().catch((e) => {
  console.error("FATAL:", e.message);
  process.exit(1);
});
