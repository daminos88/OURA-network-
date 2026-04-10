function mean(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function variance(arr) {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  return mean(arr.map(x => (x - m) ** 2));
}

function std(arr) {
  return Math.sqrt(variance(arr));
}

function percentile(arr, p) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const idx = Math.max(0, Math.min(s.length - 1, Math.floor((p / 100) * (s.length - 1))));
  return s[idx];
}

export function calibrateOuraV2({ history = [] } = {}) {
  if (!history.length) {
    return {
      A_corr: 0.5,
      refLiquidity: 1,
      decayThreshold: 0.001,
      gammaMin: 0.01,
      kappaMax: 0.8,
      sigmaMin: 0.01,
      omegaMax: Number.POSITIVE_INFINITY,
      contaminationThreshold: 0.5
    };
  }

  const liquidities = history.map(x => Number(x.liquidity ?? 0)).filter(Number.isFinite);
  const correlations = history.map(x => Number(x.correlation ?? 0)).filter(Number.isFinite);
  const xiDots = history.map(x => Number(x.XiDot ?? 0)).filter(Number.isFinite);
  const gammas = history.map(x => Number(x.G ?? 0)).filter(Number.isFinite);
  const kappas = history.map(x => Number(x.K ?? 0)).filter(Number.isFinite);
  const sigmas = history.map(x => Number(x.Sigma ?? 0)).filter(Number.isFinite);
  const omegas = history.map(x => Number(x.Omega ?? 0)).filter(Number.isFinite);

  return {
    A_corr: correlations.length ? mean(correlations) : 0.5,
    refLiquidity: liquidities.length ? mean(liquidities) : 1,
    decayThreshold: xiDots.length ? std(xiDots) : 0.001,
    gammaMin: gammas.length ? percentile(gammas, 25) : 0.01,
    kappaMax: kappas.length ? percentile(kappas, 90) : 0.8,
    sigmaMin: sigmas.length ? percentile(sigmas, 25) : 0.01,
    omegaMax: omegas.length ? percentile(omegas, 90) : Number.POSITIVE_INFINITY,
    contaminationThreshold: correlations.length ? percentile(correlations, 75) : 0.5
  };
}
