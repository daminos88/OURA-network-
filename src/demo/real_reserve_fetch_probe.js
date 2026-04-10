import { fetchPairReserves } from "../core/real_reserve_fetch.js";

// Example Arbitrum Uniswap V2-style pair (replace with any known pair)
const RPC = "https://arb-mainnet.g.alchemy.com/v2/HHLjeTEA3XMBAwEIwHzmy";

// Example pair (WETH/USDC on SushiSwap Arbitrum - may vary)
const SAMPLE_PAIR = "0x905dfCD5649217c42684f23958568e533C711Aa3";

console.log("=== REAL RESERVE FETCH PROBE START ===");

async function run() {
  const res = await fetchPairReserves({
    rpcUrl: RPC,
    pairAddress: SAMPLE_PAIR
  });

  console.log("RESERVE SNAPSHOT:");
  console.log(res);
}

run().catch(e => {
  console.error("FATAL:", e.message);
});
