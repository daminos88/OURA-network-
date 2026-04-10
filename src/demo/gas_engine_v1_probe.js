import { rerankByTrueExecutableProfit } from "../core/gas_engine_v1.js";

console.log("=== GAS ENGINE V1 PROBE START ===");

async function run() {
  const candidates = [
    { modeledRealNet: 0.002 },
    { modeledRealNet: 0.0005 }
  ];

  const res = rerankByTrueExecutableProfit(candidates, {
    gasUnits: 250000,
    gasPriceGwei: 0.1
  });

  console.log("RERANKED:");
  console.log(res);
}

run().catch(e => {
  console.error("FATAL:", e.message);
});
