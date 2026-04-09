import { initGovernance, governanceGate, sealReview, admiralVote, getCase } from "../core/governance/seal_admiral.js";

console.log("=== SEAL / ADMIRAL PROBE START ===");

initGovernance();

const signal = {
  venue: "UNISWAP_V2->SUSHISWAP->CAMELOT",
  path: ["WETH", "USDC", "DAI", "WETH"],
  size: 0.0025,
  netEth: 0.00008,
  realNet: 0.00003
};

const oura = {
  decision: "ACCEPT",
  confidence: 0.82,
  entropy: 0.02,
  drift: 0.01
};

const gate = governanceGate({ signal, oura, metadata: { source: "phase4-sidecar" } });
console.log("GATE:", gate);

const afterSeal = sealReview({ caseId: gate.caseId, sealId: "seal-alpha", recommendation: "APPROVE" });
console.log("AFTER SEAL:", afterSeal.status);

const afterAdmiral1 = admiralVote({ caseId: gate.caseId, admiralId: "admiral-1", vote: "AUTHORIZE" });
console.log("AFTER ADMIRAL 1:", afterAdmiral1.status);

const afterAdmiral2 = admiralVote({ caseId: gate.caseId, admiralId: "admiral-2", vote: "AUTHORIZE" });
console.log("AFTER ADMIRAL 2:", afterAdmiral2.status);

console.log("FINAL:", getCase(gate.caseId));
