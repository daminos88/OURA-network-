export function buildMetricsRecord({ id = null, timestamp = null, summary = {}, metadata = {} } = {}) {
  return {
    id,
    timestamp: timestamp ?? new Date().toISOString(),
    summary,
    metadata
  };
}

export function toJsonl(records = []) {
  return records.map((r) => JSON.stringify(r)).join("\n");
}

export function appendMetricsRecord(records = [], record = {}) {
  return [...records, record];
}

export function buildMetricsPersistenceBatch({ existing = [], record } = {}) {
  const next = appendMetricsRecord(existing, record);
  return {
    ok: true,
    count: next.length,
    records: next,
    jsonl: toJsonl(next)
  };
}
