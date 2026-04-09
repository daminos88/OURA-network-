import { rankSignals } from "../core/signal_ranker.js";

console.log("=== SIGNAL RANKER PROBE START ===");

const signals = [
  {
    venue: "UNISWAP_V2->SUSHISWAP->CAMELOT",
    path: ["WETH", "USDC", "DAI", "WETH"],
    size: 0.0025,
    netEth: 0.00008,
    realNet: 0.00003
  },
  {
    venue: "SUSHISWAP->UNISWAP_V2->UNISWAP_V2",
    path: ["WETH", "USDT", "USDC", "WETH"],
    size: 0.001,
    netEth: 0.00005,
    realNet: 0.00001
  },
  {
    venue: "UNISWAP_V2->UNISWAP_V2->SUSHISWAP",
    path: ["WETH", "USDC", "USDT", "WETH"],
    size: 0.005,
    netEth: 0.00012,
    realNet: -0.00002
  }
];

const ranked = rankSignals(signals);
console.log(ranked);
