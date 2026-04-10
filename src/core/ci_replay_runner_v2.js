import { runReplayHarnessV1 } from "./replay_harness_v1.js";

export async function runCiReplayRunnerV2({ fixtures = [] } = {}) {
  const res = await runReplayHarnessV1({ fixtures });

  const passed = Boolean(res?.ok) && Array.isArray(res?.results) && res.results.every((r) => r.ok);

  return {
    ok: true,
    passed,
    summary: res?.summary ?? {},
    results: res?.results ?? []
  };
}
