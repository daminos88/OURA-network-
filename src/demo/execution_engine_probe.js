import { runExecutionDecision } from "../core/execution_engine.js";

console.log("=== EXECUTION ENGINE PROBE START ===");

const signal = {
  venue: "UNISWAP_V2->SUSHISWAP->CAMELOT",
  path: ["WETH", "USDC", "DAI", "WETH"],
  size: 0.0025,
  netEth: 0.00008,
  ethBack: 0.00253
};

function run() {
  const res = runExecutionDecision({ signal });

  console.log("EXECUTION:", res.execution);
  console.log("OURA:", res.oura);
  console.log("GOVERNANCE:", res.governance);
  console.log("ACTION:", res.action);
}

run();
