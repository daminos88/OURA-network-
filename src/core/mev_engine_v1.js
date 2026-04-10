export function estimateMevRisk({
  slippageBps = 0,
  weakestDepth = 0,
  hops = 1,
  gasPriceGwei = 0.1,
  priorityFeeGwei = 0.01
} = {}) {
  const slippageRisk = Number(slippageBps) / 10000;
  const depthPenalty = weakestDepth > 0 ? Math.min(1, 1000 / Number(weakestDepth)) : 1;
  const hopPenalty = Math.min(1, Number(hops) / 5);
  const feePressure = Math.min(1, (Number(gasPriceGwei) + Number(priorityFeeGwei)) / 100);

  const mevRiskScore = (
    slippageRisk * 0.35 +
    depthPenalty * 0.35 +
    hopPenalty * 0.15 +
    feePressure * 0.15
  );

  let mevBand = "LOW";
  if (mevRiskScore >= 0.66) mevBand = "HIGH";
  else if (mevRiskScore >= 0.33) mevBand = "MEDIUM";

  return {
    ok: true,
    mevRiskScore,
    mevBand,
    factors: {
      slippageRisk,
      depthPenalty,
      hopPenalty,
      feePressure
    }
  };
}

export function applyMevProtection(candidate, config = {}) {
  const route = Array.isArray(candidate?.route) ? candidate.route : [];
  const weakestDepth = Number(candidate?.weakestDepth ?? 0);
  const hops = Array.isArray(candidate?.path) ? candidate.path.length : route.length || 1;

  const totalPenalty = Number(candidate?.slippageModel?.totalPenalty ?? 0);
  const size = Number(candidate?.size ?? 0);
  const slippageBps = size > 0 ? (totalPenalty / size) * 10000 : 0;

  const mev = estimateMevRisk({
    slippageBps,
    weakestDepth,
    hops,
    gasPriceGwei: config.gasPriceGwei ?? 0.1,
    priorityFeeGwei: config.priorityFeeGwei ?? 0.01
  });

  const mevDiscount = (candidate?.trueExecutableProfit ?? candidate?.modeledRealNet ?? candidate?.realNet ?? 0) * mev.mevRiskScore;
  const protectedProfit = (candidate?.trueExecutableProfit ?? candidate?.modeledRealNet ?? candidate?.realNet ?? 0) - mevDiscount;

  return {
    ...candidate,
    mevModel: mev,
    mevDiscount,
    protectedProfit,
    executableAfterMev: protectedProfit > 0 && mev.mevBand !== "HIGH"
  };
}

export function rerankByProtectedProfit(candidates = [], config = {}) {
  return candidates
    .map((c) => applyMevProtection(c, config))
    .sort((a, b) => (b.protectedProfit ?? -Infinity) - (a.protectedProfit ?? -Infinity));
}
