import { scanBestSizeV2 } from "../core/size_scanner_v2.js";

const RPC = "https://arb-mainnet.g.alchemy.com/v2/HHLjeTEA3XMBAwEIwHzmy";

console.log("=== SCANNER V2 PROBE START ===");

async function run() {
  const res = await scanBestSizeV2({ rpcUrl: RPC });
  console.log(res);
}

run().catch(e => {
  console.error("FATAL:", e.message);
});
