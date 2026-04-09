import { comparePairAcrossRouters } from "../core/price_compare.js";

const RPC = "https://arb-mainnet.g.alchemy.com/v2/HHLjeTEA3XMBAwEIwHzmy";

console.log("=== PRICE DIVERGENCE PROBE START ===");

async function run() {
  const res = await comparePairAcrossRouters({
    rpcUrl: RPC,
    pair: ["WETH", "USDC"],
    amountInEth: 0.001
  });

  if (!res.ok) {
    console.log("ERROR:", res.reason);
    return;
  }

  console.log("QUOTES:", res.quotes);
  console.log("BEST EDGE:", res.bestEdge);
}

run().catch(e => {
  console.error("FATAL:", e.message);
  process.exit(1);
});
