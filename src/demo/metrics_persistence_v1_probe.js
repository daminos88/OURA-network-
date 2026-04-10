import { buildMetricsRecord, buildMetricsPersistenceBatch } from "../core/metrics_persistence_v1.js";

console.log("=== METRICS PERSISTENCE V1 PROBE START ===");

async function run() {
  const baseRecords = [];

  const record1 = buildMetricsRecord({
    id: "run_1",
    summary: { winner: true, finalCandidates: 2 },
    metadata: { source: "live_loop_v4" }
  });

  const record2 = buildMetricsRecord({
    id: "run_2",
    summary: { winner: false, finalCandidates: 0 },
    metadata: { source: "replay_harness" }
  });

  const batch1 = buildMetricsPersistenceBatch({ existing: baseRecords, record: record1 });
  const batch2 = buildMetricsPersistenceBatch({ existing: batch1.records, record: record2 });

  console.log("METRICS JSONL OUTPUT:");
  console.log(batch2.jsonl);
}

run().catch((e) => {
  console.error("FATAL:", e.message);
});
