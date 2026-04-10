import { buildFilteredLiquidityRoutes } from "../core/reserve_scanner_v2.js";

const RPC = "https://arb-mainnet.g.alchemy.com/v2/HHLjeTEA3XMBAwEIwHzmy";

// Example pair descriptors (replace with real pool addresses)
const PAIRS = [
  {
    pairAddress: "0x905dfCD5649217c42684f23958568e533C711Aa3",
    venue: "SUSHI",
    tokenPath: ["WETH", "USDC"]
  }
];

console.log("=== RESERVE SCANNER V2 PROBE START ===");

async function run() {
  const res = await buildFilteredLiquidityRoutes({
    rpcUrl: RPC,
    pairDescriptors: PAIRS,
    minWeakestDepth: 100,
    minLiquidityScore: 1
  });

  console.log("ALL ROUTES:");
  console.log(res.routes);

  console.log("ALLOWED ROUTES:");
  console.log(res.allowed);
}

run().catch(e => {
  console.error("FATAL:", e.message);
});
