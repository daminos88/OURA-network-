export function normalize(value, min, max) {
  if (max === min) return 0;
  return (value - min) / (max - min);
}

export function scoreSignal(signal) {
  const profit = signal?.netEth ?? 0;
  const realNet = signal?.realNet ?? profit;
  const size = signal?.size ?? 0.001;
  const hops = signal?.path?.length ?? 1;

  const profitScore = Math.max(0, realNet);
  const efficiency = size > 0 ? realNet / size : 0;
  const complexityPenalty = hops > 0 ? 1 / hops : 1;

  const score = (
    profitScore * 0.5 +
    efficiency * 0.3 +
    complexityPenalty * 0.2
  );

  return {
    score,
    components: {
      profitScore,
      efficiency,
      complexityPenalty
    }
  };
}

export function rankSignals(signals = []) {
  const scored = signals.map((s) => {
    const res = scoreSignal(s);
    return { ...s, ...res };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.map((s, idx) => ({
    ...s,
    rank: idx + 1
  }));
}
