import { runReplayHarnessV2 } from "./replay_harness_v2.js";

export async function runCiReplayRunnerV3({ fixtures = [] } = {}) {
  const res = await runReplayHarnessV2({ fixtures });

  const passed = Boolean(res?.ok) && Array.isArray(res?.results) && res.results.every((r) => r.ok);

  return {
    ok: true,
    passed,
    summary: res?.summary ?? {},
    results: res?.results ?? []
  };
}
