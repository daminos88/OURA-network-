import { computeAllGreeksV2 } from "./oura_primitives_v2.js";

function signOf(value, epsilon = 1e-9) {
  const x = Number(value ?? 0);
  if (!Number.isFinite(x)) return 0;
  if (x > epsilon) return 1;
  if (x < -epsilon) return -1;
  return 0;
}

function delta(curr, prev) {
  const a = Number(curr ?? 0);
  const b = Number(prev ?? 0);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
  return a - b;
}

function charged(value, previousValue = 0) {
  const v = Number(value ?? 0);
  const p = Number(previousValue ?? 0);
  const momentum = delta(v, p);
  return {
    value: Number.isFinite(v) ? v : 0,
    charge: signOf(v),
    momentum: Number.isFinite(momentum) ? momentum : 0
  };
}

export function computeChargedGreeks(candidate = {}, previous = {}, config = {}) {
  const current = computeAllGreeksV2(candidate, config);

  return {
    K: charged(current.K, previous?.K),
    G: charged(current.G, previous?.G),
    Omega: charged(current.Omega, previous?.Omega),
    XiDot: charged(current.XiDot, previous?.XiDot),
    Pi: charged(current.Pi, previous?.Pi),
    Eta: charged(current.Eta, previous?.Eta),
    Sigma: charged(current.Sigma, previous?.Sigma)
  };
}

export function summarizeChargedPhase(chargedGreeks = {}) {
  const values = Object.values(chargedGreeks);
  const plus = values.filter((g) => g?.charge === 1).length;
  const minus = values.filter((g) => g?.charge === -1).length;
  const neutral = values.filter((g) => g?.charge === 0).length;
  const momentum = values.reduce((acc, g) => acc + Number(g?.momentum ?? 0), 0);

  let state = "EQUILIBRIUM";
  if (plus > minus && momentum > 0) state = "SUMMON";
  else if (minus > plus && momentum < 0) state = "EXTRACT";
  else if (plus === minus) state = "BALANCED";

  return {
    plus,
    minus,
    neutral,
    momentum,
    state
  };
}
