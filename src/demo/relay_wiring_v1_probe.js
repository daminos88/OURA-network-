import { applyRelayWiring } from "../core/relay_wiring_v1.js";

console.log("=== RELAY WIRING V1 PROBE START ===");

async function run() {
  const candidates = [
    { mempool: { mode: "PUBLIC", reason: "low_mev" } },
    { mempool: { mode: "PRIVATE", reason: "high_mev" } },
    { mempool: { mode: "BUNDLE", reason: "arb_bundle" } },
    { mempool: { mode: "ABORT", reason: "guard_block" } }
  ];

  const config = {
    publicRpcUrl: "https://arb1.arbitrum.io/rpc",
    privateRelayUrl: "https://private-relay.example",
    bundleRelayUrl: "https://bundle-relay.example"
  };

  const res = applyRelayWiring(candidates, config);

  console.log("RELAY WIRING RESULT:");
  console.log(res);
}

run().catch((e) => {
  console.error("FATAL:", e.message);
});
