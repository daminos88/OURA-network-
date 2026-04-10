export function summarizeLiveLoop(results = []) {
  const cycles = results.length;
  const winnerCount = results.filter(r => r?.winner).length;
  const blockedCount = results.filter(r => (r?.governanceAction ?? "") !== "ESCALATE_TO_SEAL").length;
  const readyCount = results.filter(r => (r?.governanceAction ?? "") === "ESCALATE_TO_SEAL").length;
  const txPlanCount = results.filter(r => r?.txPlan).length;
  const avgLedgerLength = cycles
    ? results.reduce((acc, r) => acc + (r?.ledgerLength ?? 0), 0) / cycles
    : 0;

  return {
    cycles,
    winner_count: winnerCount,
    no_winner_count: cycles - winnerCount,
    blocked_count: blockedCount,
    ready_count: readyCount,
    txplan_count: txPlanCount,
    average_ledger_length: avgLedgerLength,
    success_ratio: cycles ? readyCount / cycles : 0,
    signal_ratio: cycles ? winnerCount / cycles : 0
  };
}

export function rollingAverages(history = []) {
  if (!history.length) {
    return {
      success_ratio_avg: 0,
      signal_ratio_avg: 0,
      ledger_avg: 0
    };
  }

  return {
    success_ratio_avg: history.reduce((a, x) => a + (x.success_ratio ?? 0), 0) / history.length,
    signal_ratio_avg: history.reduce((a, x) => a + (x.signal_ratio ?? 0), 0) / history.length,
    ledger_avg: history.reduce((a, x) => a + (x.average_ledger_length ?? 0), 0) / history.length
  };
}
