import { buildCalldataPlan } from "../core/calldata_tx_builder_v1.js";

console.log("=== CALLDATA TX BUILDER V1 PROBE START ===");

async function run() {
  const res = buildCalldataPlan({
    token: "0xTokenAddress",
    spender: "0xRouterAddress",
    amount: 1,
    router: "0xRouterAddress",
    amountOutMin: 0.99,
    path: ["0xTokenA", "0xTokenB"],
    to: "0xYourAddress",
    deadline: Math.floor(Date.now() / 1000) + 60 * 5,
    decimals: 18
  });

  console.log("CALLDATA PLAN:");
  console.log(res);
}

run().catch(e => {
  console.error("FATAL:", e.message);
});
