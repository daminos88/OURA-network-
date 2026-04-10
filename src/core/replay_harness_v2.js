import { runOrchestratedExecutionV5D } from "./orchestrated_execution_v5d.js";

export async function runReplayHarnessV2({ fixtures = [] } = {}) {
  const results = [];

  for (const fixture of fixtures) {
    const res = await runOrchestratedExecutionV5D({
      rpcUrl: fixture.rpcUrl,
      riskConfig: fixture.riskConfig ?? {},
      reserveConfig: fixture.reserveConfig ?? {},
      executionConfig: fixture.executionConfig ?? {},
      calibrationHistory: fixture.calibrationHistory ?? []
    });

    results.push({
      id: fixture.id ?? null,
      ok: Boolean(res?.ok),
      winner: Boolean(res?.winner),
      finalCandidates: Array.isArray(res?.finalCandidates) ? res.finalCandidates.length : 0,
      killSwitchEngaged: Array.isArray(res?.killWrapped)
        ? res.killWrapped.some((c) => c?.killSwitch?.engaged)
        : false,
      nonceConsistent: Boolean(res?.nonceConsistent),
      result: res
    });
  }

  const summary = {
    total: results.length,
    ok_count: results.filter((r) => r.ok).length,
    winner_count: results.filter((r) => r.winner).length,
    kill_switch_count: results.filter((r) => r.killSwitchEngaged).length,
    nonce_consistent_count: results.filter((r) => r.nonceConsistent).length,
    total_final_candidates: results.reduce((acc, r) => acc + (r.finalCandidates || 0), 0)
  };

  return {
    ok: true,
    results,
    summary
  };
}
