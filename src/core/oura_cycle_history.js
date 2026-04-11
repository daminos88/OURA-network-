export function appendCycleState(history = [], cycle = {}) {
  const prev = Array.isArray(history) ? history : [];
  const entry = {
    cycleId: cycle?.cycleId ?? prev.length + 1,
    ts: Number(cycle?.ts ?? Date.now()),
    decision: String(cycle?.decision ?? "UNKNOWN"),
    plusForce: Number(cycle?.plusForce ?? 0),
    minusForce: Number(cycle?.minusForce ?? 0),
    dominance: Number(cycle?.dominance ?? 0),
    accepted: Boolean(cycle?.accepted ?? false)
  };

  return [...prev, entry];
}

export function summarizeCycleHistory(history = []) {
  const rows = Array.isArray(history) ? history : [];
  const total = rows.length;
  const accepted = rows.filter((r) => r.accepted).length;
  const decisions = rows.reduce((acc, row) => {
    const key = String(row?.decision ?? "UNKNOWN");
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const dominanceAvg = total === 0
    ? 0
    : rows.reduce((acc, row) => acc + Number(row?.dominance ?? 0), 0) / total;

  return {
    total,
    accepted,
    rejected: total - accepted,
    decisions,
    dominanceAvg
  };
}
