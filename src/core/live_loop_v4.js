import { runOrchestratedExecutionV1 } from "./orchestrated_execution_v1.js";

export async function runLiveLoopV4({ rpcUrl, cycles = 3, riskConfig = {}, reserveConfig = {}, executionConfig = {} }) {
  const results = [];

  for (let i = 0; i < cycles; i++) {
    const res = await runOrchestratedExecutionV1({
      rpcUrl,
      riskConfig,
      reserveConfig,
      executionConfig
    });

    results.push({
      cycle: i + 1,
      winner: Boolean(res.winner),
      finalCandidates: Array.isArray(res.finalCandidates) ? res.finalCandidates.length : 0,
      killSwitchEngaged: Array.isArray(res.killWrapped)
        ? res.killWrapped.some((c) => c?.killSwitch?.engaged)
        : false,
      payload: res
    });
  }

  const summary = {
    cycles,
    winner_count: results.filter((r) => r.winner).length,
    no_winner_count: results.filter((r) => !r.winner).length,
    total_final_candidates: results.reduce((acc, r) => acc + (r.finalCandidates || 0), 0),
    kill_switch_engaged_count: results.filter((r) => r.killSwitchEngaged).length
  };

  return {
    ok: true,
    results,
    summary
  };
}
