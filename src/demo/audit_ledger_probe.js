import { buildDecisionLedger } from "../core/audit_ledger.js";

console.log("=== AUDIT LEDGER PROBE START ===");

const ledger = buildDecisionLedger({
  ranked: [{ rank: 1, score: 0.9 }],
  winner: { venue: "UNISWAP_V2", score: 0.9 },
  risk: { allow: true, flags: [] },
  routePlan: { steps: ["WETH->USDC", "USDC->DAI"] },
  txPlan: { txCount: 4 },
  governance: { action: "ESCALATE_TO_SEAL" }
});

console.log(ledger);
