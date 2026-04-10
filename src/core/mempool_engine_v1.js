export function decideMempoolStrategy(candidate = {}, config = {}) {
  const mevBand = String(candidate?.mevModel?.mevBand ?? "UNKNOWN");
  const protectedProfit = Number(candidate?.protectedProfit ?? 0);
  const urgency = Number(config.urgency ?? 0.5); // 0..1

  let mode = "PUBLIC";
  let reason = "default";

  if (mevBand === "HIGH") {
    mode = "PRIVATE";
    reason = "high_mev_risk";
  } else if (mevBand === "MEDIUM") {
    mode = urgency > 0.7 ? "BUNDLE" : "PRIVATE";
    reason = "medium_mev_risk";
  } else if (mevBand === "LOW") {
    mode = urgency > 0.8 ? "PUBLIC" : "PRIVATE";
    reason = "low_mev_risk";
  }

  if (protectedProfit <= 0) {
    mode = "ABORT";
    reason = "non_positive_profit";
  }

  return {
    ok: true,
    mode, // PUBLIC | PRIVATE | BUNDLE | ABORT
    reason,
    params: {
      useFlashbots: mode === "BUNDLE",
      usePrivateRelay: mode === "PRIVATE" || mode === "BUNDLE",
      maxBlockDelay: mode === "PUBLIC" ? 0 : 2
    }
  };
}

export function applyMempoolStrategy(candidates = [], config = {}) {
  return candidates.map((c) => ({
    ...c,
    mempool: decideMempoolStrategy(c, config)
  }));
}
