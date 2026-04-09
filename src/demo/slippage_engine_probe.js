import { computeConstantProductOut, estimateTriangularSlippage } from "../core/slippage_engine.js";

console.log("=== SLIPPAGE ENGINE PROBE START ===");

const single = computeConstantProductOut({
  reserveIn: 100,
  reserveOut: 200,
  amountIn: 1,
  feeBps: 30
});

console.log("SINGLE SWAP:", single);

const route = [
  { reserveIn: 100, reserveOut: 200, feeBps: 30 },
  { reserveIn: 200, reserveOut: 150, feeBps: 30 },
  { reserveIn: 150, reserveOut: 110, feeBps: 30 }
];

const tri = estimateTriangularSlippage({ route, amountIn: 1 });

console.log("TRIANGULAR:", tri);
