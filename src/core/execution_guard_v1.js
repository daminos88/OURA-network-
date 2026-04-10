export function evaluateExecutionGuard(candidate = {}, context = {}) {
  const protectedProfit = Number(candidate?.protectedProfit ?? candidate?.trueExecutableProfit ?? candidate?.modeledRealNet ?? candidate?.realNet ?? candidate?.netEth ?? 0);
  const mevBand = String(candidate?.mevModel?.mevBand ?? "UNKNOWN");
  const liquidityAllow = candidate?.liquidityAllow !== false;
  const governanceAction = String(context?.governanceAction ?? candidate?.governanceAction ?? "UNKNOWN");
  const nonceConsistent = context?.nonceConsistent !== false;

  const reasons = [];
  let allow = true;

  if (protectedProfit <= 0) {
    allow = false;
    reasons.push("protected_profit_non_positive");
  }

  if (mevBand === "HIGH") {
    allow = false;
    reasons.push("high_mev_risk");
  }

  if (!liquidityAllow) {
    allow = false;
    reasons.push("liquidity_disallowed");
  }

  if (governanceAction && governanceAction !== "ESCALATE_TO_SEAL") {
    allow = false;
    reasons.push("governance_not_ready");
  }

  if (!nonceConsistent) {
    allow = false;
    reasons.push("nonce_inconsistent");
  }

  return {
    ok: true,
    allow,
    reasons,
    status: allow ? "EXECUTION_ALLOWED" : "EXECUTION_BLOCKED"
  };
}

export function applyExecutionGuard(candidates = [], context = {}) {
  return candidates.map((candidate) => ({
    ...candidate,
    executionGuard: evaluateExecutionGuard(candidate, context)
  }));
}
