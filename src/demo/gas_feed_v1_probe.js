import { fetchGasFeedV1 } from "../core/gas_feed_v1.js";

console.log("=== GAS FEED V1 PROBE START ===");

async function run() {
  const res = await fetchGasFeedV1({
    rpcUrl: "http://localhost:8545"
  });

  console.log("GAS FEED RESULT:");
  console.log(res);
}

run().catch((e) => {
  console.error("FATAL:", e.message);
});
