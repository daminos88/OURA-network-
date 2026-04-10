import { prepareTradeBundleV2 } from "../core/trade_bundle_v2.js";

console.log("=== TRADE BUNDLE V2 PROBE START ===");

async function run() {
  const res = await prepareTradeBundleV2({
    rpcUrl: "http://localhost:8545",
    riskConfig: {},
    reserveConfig: {},
    executionConfig: {
      gasUnits: 250000,
      gasPriceGwei: 0.1,
      priorityFeeGwei: 0.01,
      urgency: 0.8,
      chainId: 42161
    }
  });

  console.log("TRADE BUNDLE V2 RESULT:");
  console.log({
    ok: res.ok,
    winner: res.winner,
    hasBundle: Boolean(res.bundle)
  });
}

run().catch((e) => {
  console.error("FATAL:", e.message);
});
