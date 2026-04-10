import { runGoldenPath } from "./golden_path.js";

export async function runLiveLoop({ rpcUrl, cycles = 3, riskConfig = {} }) {
  const results = [];

  for (let i = 0; i < cycles; i++) {
    const res = await runGoldenPath({ rpcUrl, riskConfig });
    results.push({
      cycle: i + 1,
      winner: Boolean(res.winner),
      governanceAction: res.governance?.action ?? "UNKNOWN",
      txPlan: Boolean(res.txPlan),
      ledgerLength: Array.isArray(res.ledger) ? res.ledger.length : 0,
      payload: res
    });
  }

  const summary = {
    cycles,
    winner_count: results.filter(r => r.winner).length,
    no_winner_count: results.filter(r => !r.winner).length,
    ready_count: results.filter(r => r.governanceAction === "ESCALATE_TO_SEAL").length,
    blocked_count: results.filter(r => r.governanceAction !== "ESCALATE_TO_SEAL").length,
    average_ledger_length: results.length
      ? results.reduce((acc, r) => acc + r.ledgerLength, 0) / results.length
      : 0
  };

  return {
    ok: true,
    results,
    summary
  };
}
