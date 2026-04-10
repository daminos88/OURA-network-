function clampBps(value) {
  const v = Number(value);
  if (!Number.isFinite(v)) return 0;
  if (v < 0) return 0;
  if (v > 10000) return 10000;
  return Math.trunc(v);
}

function safeDivBps(num, den) {
  const n = Number(num);
  const d = Number(den);
  if (!Number.isFinite(n) || !Number.isFinite(d) || d <= 0) return 0;
  return Math.trunc((n * 10000) / d);
}

export function computeOuraStateV2({
  realNetBps = 0,
  costBps = 0,
  riskBps = 0,
  confidenceBps = 0,
  liquidityBps = 0,
  mevRiskBps = 0
} = {}) {
  const net = clampBps(realNetBps);
  const cost = clampBps(costBps);
  const risk = clampBps(riskBps);
  const conf = clampBps(confidenceBps);
  const liq = clampBps(liquidityBps);
  const mev = clampBps(mevRiskBps);

  const positiveForce = Math.trunc((net + conf + liq) / 3);
  const negativeForce = Math.trunc((cost + risk + mev) / 3);
  const coherenceBps = clampBps(Math.max(0, positiveForce - negativeForce + 5000));

  const decision = coherenceBps >= 6000 ? "EXECUTE" : coherenceBps >= 4500 ? "HOLD" : "REJECT";

  return {
    ok: true,
    units: "bps",
    coherenceBps,
    positiveForceBps: positiveForce,
    negativeForceBps: negativeForce,
    decision
  };
}

export function deriveOuraInputsV2(candidate = {}) {
  const protectedProfit = Number(candidate?.protectedProfit ?? candidate?.trueExecutableProfit ?? candidate?.modeledRealNet ?? 0);
  const size = Number(candidate?.size ?? 0);
  const mevScore = Number(candidate?.mevModel?.mevRiskScore ?? 0);
  const weakestDepth = Number(candidate?.weakestDepth ?? 0);
  const gasEth = Number(candidate?.gasModel?.gasEth ?? 0);

  const realNetBps = safeDivBps(protectedProfit, size || 1);
  const costBps = safeDivBps(gasEth, size || 1);
  const riskBps = clampBps(Math.trunc(mevScore * 10000));
  const confidenceBps = clampBps(candidate?.executionGuard?.allow ? 8000 : 2000);
  const liquidityBps = clampBps(Math.min(10000, Math.trunc(weakestDepth)));
  const mevRiskBps = riskBps;

  return {
    ok: true,
    realNetBps,
    costBps,
    riskBps,
    confidenceBps,
    liquidityBps,
    mevRiskBps
  };
}

export function ouraVerdictV2(candidate = {}) {
  const inputs = deriveOuraInputsV2(candidate);
  const state = computeOuraStateV2(inputs);

  return {
    ok: true,
    inputs,
    state
  };
}
