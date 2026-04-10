import { runOrchestratedExecutionV1 } from "./orchestrated_execution_v1.js";

export async function runReplayHarnessV1({ fixtures = [] } = {}) {
  const results = [];

  for (const fixture of fixtures) {
    const res = await runOrchestratedExecutionV1({
      rpcUrl: fixture.rpcUrl,
      riskConfig: fixture.riskConfig ?? {},
      reserveConfig: fixture.reserveConfig ?? {},
      executionConfig: fixture.executionConfig ?? {}
    });

    results.push({
      id: fixture.id ?? null,
      ok: Boolean(res?.ok),
      winner: Boolean(res?.winner),
      finalCandidates: Array.isArray(res?.finalCandidates) ? res.finalCandidates.length : 0,
      killSwitchEngaged: Array.isArray(res?.killWrapped)
        ? res.killWrapped.some((c) => c?.killSwitch?.engaged)
        : false,
      result: res
    });
  }

  const summary = {
    total: results.length,
    ok_count: results.filter((r) => r.ok).length,
    winner_count: results.filter((r) => r.winner).length,
    kill_switch_count: results.filter((r) => r.killSwitchEngaged).length,
    total_final_candidates: results.reduce((acc, r) => acc + (r.finalCandidates || 0), 0)
  };

  return {
    ok: true,
    results,
    summary
  };
}
