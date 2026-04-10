import { applyRelayPlanning } from "../core/relay_integration_v1.js";

console.log("=== RELAY INTEGRATION V1 PROBE START ===");

async function run() {
  const candidates = [
    {
      mempool: { mode: "PUBLIC", reason: "low_mev_risk", params: { maxBlockDelay: 0 } },
      retry: { action: "RETRY" },
      calldataPlan: {
        steps: [
          { txKind: "ERC20_APPROVE", target: "0xToken", value: "0x0", data: "0xabc", gasLimitHint: 65000 },
          { txKind: "SWAP", target: "0xRouter", value: "0x0", data: "0xdef", gasLimitHint: 300000 }
        ]
      }
    }
  ];

  const res = applyRelayPlanning(candidates);

  console.log("RELAY PLAN:");
  console.log(res);
}

run().catch(e => {
  console.error("FATAL:", e.message);
});
