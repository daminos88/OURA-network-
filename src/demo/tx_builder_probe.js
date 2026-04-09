import { buildTxPlan } from "../core/tx_builder.js";

console.log("=== TX BUILDER PROBE START ===");

const signal = {
  venue: "UNISWAP_V2",
  path: ["WETH", "USDC", "DAI", "WETH"],
  size: 0.0025,
  netEth: 0.00008,
  realNet: 0.00003,
  ethBack: 0.00253
};

const res = buildTxPlan(signal);
console.log(res);
