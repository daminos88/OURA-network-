function safeDiv(a, b) {
  const x = Number(a ?? 0);
  const y = Number(b ?? 0);
  if (!Number.isFinite(x) || !Number.isFinite(y) || y === 0) return 0;
  return x / y;
}

function mean(values = []) {
  const arr = values.map((v) => Number(v)).filter(Number.isFinite);
  if (!arr.length) return 0;
  return arr.reduce((acc, v) => acc + v, 0) / arr.length;
}

function variance(values = []) {
  const arr = values.map((v) => Number(v)).filter(Number.isFinite);
  if (arr.length < 2) return 0;
  const m = mean(arr);
  return arr.reduce((acc, v) => acc + (v - m) * (v - m), 0) / arr.length;
}

function std(values = []) {
  return Math.sqrt(variance(values));
}

function linearRegressionSlope(xs = [], ys = []) {
  const n = Math.min(xs.length, ys.length);
  if (n < 2) return 0;

  const x = xs.slice(0, n).map(Number).filter(Number.isFinite);
  const y = ys.slice(0, n).map(Number).filter(Number.isFinite);
  if (x.length !== n || y.length !== n) return 0;

  const mx = mean(x);
  const my = mean(y);

  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - mx;
    num += dx * (y[i] - my);
    den += dx * dx;
  }

  return den === 0 ? 0 : num / den;
}

export function computeKappa({ ofi = 0, ofiCrit = 1 } = {}) {
  return safeDiv(Math.abs(Number(ofi ?? 0)), Math.abs(Number(ofiCrit ?? 1)) || 1);
}

export function computeGamma({ priceA = 0, priceB = 0, sizeA = 1, sizeB = 1 } = {}) {
  const dp = Number(priceA ?? 0) - Number(priceB ?? 0);
  const ds = (Math.abs(Number(sizeA ?? 1)) + Math.abs(Number(sizeB ?? 1))) / 2 || 1;
  const magnitude = Math.abs(dp) / ds;
  return {
    gamma1: magnitude,
    gamma2: 0,
    magnitude
  };
}

export function computeOmega({ depthLevels = [], slippageModel = null } = {}) {
  const levels = Array.isArray(depthLevels) ? depthLevels : [];
  if (!levels.length) {
    const fallback = Number(slippageModel?.projectedCost ?? 0);
    return Number.isFinite(fallback) ? fallback : 0;
  }

  let weighted = 0;
  let totalWeight = 0;
  for (let i = 0; i < levels.length; i++) {
    const level = levels[i] ?? {};
    const depth = Math.abs(Number(level.depth ?? level.liquidity ?? 0));
    const cost = Math.abs(Number(level.cost ?? level.slippage ?? 0));
    if (!Number.isFinite(depth) || !Number.isFinite(cost) || depth === 0) continue;
    const weight = 1 / (1 + i);
    weighted += cost * weight;
    totalWeight += weight;
  }

  return totalWeight === 0 ? 0 : weighted / totalWeight;
}

export function computeXiDot({ correlationSeries = [] } = {}) {
  const arr = Array.isArray(correlationSeries) ? correlationSeries.map(Number).filter(Number.isFinite) : [];
  if (arr.length < 2) return 0;
  const xs = arr.map((_, i) => i);
  return linearRegressionSlope(xs, arr);
}

export function computePi({ spectrum = [], slippageModel = null } = {}) {
  const spec = Array.isArray(spectrum) ? spectrum : [];
  let xs = [];
  let ys = [];

  for (const point of spec) {
    const f = Number(point?.f ?? point?.frequency ?? 0);
    const p = Number(point?.p ?? point?.power ?? 0);
    if (f > 0 && p > 0) {
      xs.push(Math.log(f));
      ys.push(Math.log(p));
    }
  }

  if (xs.length < 2) {
    const legs = Array.isArray(slippageModel?.legs) ? slippageModel.legs : [];
    xs = [];
    ys = [];
    for (let i = 0; i < legs.length; i++) {
      const value = Math.abs(Number(legs[i]?.impact ?? legs[i]?.slippage ?? 0));
      if (value > 0) {
        xs.push(Math.log(i + 1));
        ys.push(Math.log(value));
      }
    }
  }

  return xs.length < 2 ? 0 : linearRegressionSlope(xs, ys);
}

export function computeEta({ correlation = 0, liquidity = 1, A_corr = 0.5 } = {}) {
  const corr = Math.abs(Number(correlation ?? 0));
  const liq = Math.abs(Number(liquidity ?? 1)) || 1;
  return safeDiv(Number(A_corr ?? 0.5) * corr, liq);
}

export function computeSigma({ edgeStd = 0, liquidity = 1, refLiquidity = 1 } = {}) {
  const edge = Math.abs(Number(edgeStd ?? 0));
  const liq = Math.abs(Number(liquidity ?? 1));
  const ref = Math.abs(Number(refLiquidity ?? 1)) || 1;
  return edge * Math.sqrt(safeDiv(liq, ref));
}

export function computeAllGreeksV2(candidate = {}, config = {}) {
  const gamma = computeGamma({
    priceA: candidate?.priceA ?? candidate?.quotes?.[0]?.price ?? 0,
    priceB: candidate?.priceB ?? candidate?.quotes?.[1]?.price ?? 0,
    sizeA: candidate?.sizeA ?? candidate?.quotes?.[0]?.size ?? candidate?.size ?? 1,
    sizeB: candidate?.sizeB ?? candidate?.quotes?.[1]?.size ?? candidate?.size ?? 1
  });

  const K = computeKappa({
    ofi: candidate?.ofi ?? 0,
    ofiCrit: config?.ofiCrit ?? 1
  });

  const Omega = computeOmega({
    depthLevels: candidate?.depthLevels ?? [],
    slippageModel: candidate?.slippageModel ?? null
  });

  const XiDot = computeXiDot({
    correlationSeries: candidate?.correlationSeries ?? []
  });

  const Pi = computePi({
    spectrum: candidate?.spectrum ?? [],
    slippageModel: candidate?.slippageModel ?? null
  });

  const Eta = computeEta({
    correlation: candidate?.correlation ?? 0,
    liquidity: candidate?.liquidity ?? 1,
    A_corr: config?.A_corr ?? 0.5
  });

  const Sigma = computeSigma({
    edgeStd: candidate?.edgeStd ?? std(candidate?.edgeHistory ?? []),
    liquidity: candidate?.liquidity ?? 1,
    refLiquidity: config?.refLiquidity ?? 1
  });

  return {
    K,
    G: gamma.magnitude,
    Omega,
    XiDot,
    Pi,
    Eta,
    Sigma
  };
}
