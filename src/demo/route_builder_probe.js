import { buildRouteBundle } from "../core/route_builder.js";

console.log("=== ROUTE BUILDER PROBE START ===");

const signal = {
  venue: "UNISWAP_V2->SUSHISWAP->CAMELOT",
  path: ["WETH", "USDC", "DAI", "WETH"],
  size: 0.0025,
  netEth: 0.00008,
  realNet: 0.00003,
  ethBack: 0.00253
};

const res = buildRouteBundle(signal);

console.log(res);
