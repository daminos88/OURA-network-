import { runCiReplayRunnerV2 } from "../core/ci_replay_runner_v2.js";

console.log("=== CI REPLAY RUNNER V2 PROBE START ===");

async function run() {
  const fixtures = [
    {
      id: "ci_fixture_1",
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
    }
  ];

  const res = await runCiReplayRunnerV2({ fixtures });

  console.log("CI RESULT:");
  console.log({ ok: res.ok, passed: res.passed, summary: res.summary });

  if (!res.passed) {
    process.exit(1);
  }
}

run().catch((e) => {
  console.error("FATAL:", e.message);
  process.exit(1);
});
