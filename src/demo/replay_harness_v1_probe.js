import { runReplayHarnessV1 } from "../core/replay_harness_v1.js";

console.log("=== REPLAY HARNESS V1 PROBE START ===");

async function run() {
  const fixtures = [
    {
      id: "fixture_1",
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
    },
    {
      id: "fixture_2",
      rpcUrl: "http://localhost:8545",
      riskConfig: {},
      reserveConfig: {},
      executionConfig: {
        gasUnits: 250000,
        gasPriceGwei: 0.2,
        priorityFeeGwei: 0.02,
        urgency: 0.9,
        chainId: 42161
      }
    }
  ];

  const res = await runReplayHarnessV1({ fixtures });

  console.log("REPLAY HARNESS RESULT:");
  console.log(res);
}

run().catch((e) => {
  console.error("FATAL:", e.message);
});
