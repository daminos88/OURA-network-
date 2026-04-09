import { runExecutionDecisionV2 } from "../core/execution_engine_v2.js";

console.log("=== EXECUTION ENGINE V2 PROBE START ===");

const signal = {
  venue: "UNISWAP_V2->SUSHISWAP->CAMELOT",
  path: ["WETH", "USDC", "DAI", "WETH"],
  size: 0.0025,
  netEth: 0.00008,
  ethBack: 0.00253
};

function run() {
  const res = runExecutionDecisionV2({ signal });

  console.log("EXECUTION:", res.execution);
  console.log("OURA:", res.oura);
  console.log("GOVERNANCE:", res.governance);
  console.log("ACTION:", res.action);
}

run();
