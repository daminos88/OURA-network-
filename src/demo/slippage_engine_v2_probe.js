import { attachRealSlippage } from "../core/slippage_engine_v2.js";

console.log("=== SLIPPAGE ENGINE V2 (REAL) PROBE START ===");

async function run() {
  const candidate = {
    venue: "SUSHI",
    path: ["WETH", "USDC"],
    size: 0.001,
    route: [
      {
        reserveIn: 1000,
        reserveOut: 2000000,
        feeBps: 30
      }
    ]
  };

  const res = attachRealSlippage(candidate);

  console.log("SLIPPAGE RESULT:");
  console.log(res);
}

run().catch(e => {
  console.error("FATAL:", e.message);
});
