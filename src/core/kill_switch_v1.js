export function evaluateKillSwitch({
  protectedProfit = 0,
  consecutiveBlocked = 0,
  maxConsecutiveBlocked = 3,
  nonceConsistent = true,
  retryTerminal = false,
  governanceFreeze = false,
  operatorFreeze = false,
  relayFailures = 0,
  maxRelayFailures = 3
} = {}) {
  const reasons = [];
  let engaged = false;

  if (Number(protectedProfit) <= 0) {
    engaged = true;
    reasons.push("protected_profit_non_positive");
  }

  if (Number(consecutiveBlocked) >= Number(maxConsecutiveBlocked)) {
    engaged = true;
    reasons.push("consecutive_block_threshold_reached");
  }

  if (!Boolean(nonceConsistent)) {
    engaged = true;
    reasons.push("nonce_inconsistent");
  }

  if (Boolean(retryTerminal)) {
    engaged = true;
    reasons.push("retry_terminal_state");
  }

  if (Boolean(governanceFreeze)) {
    engaged = true;
    reasons.push("governance_freeze");
  }

  if (Boolean(operatorFreeze)) {
    engaged = true;
    reasons.push("operator_freeze");
  }

  if (Number(relayFailures) >= Number(maxRelayFailures)) {
    engaged = true;
    reasons.push("relay_failure_threshold_reached");
  }

  return {
    ok: true,
    engaged,
    status: engaged ? "KILL_SWITCH_ENGAGED" : "KILL_SWITCH_CLEAR",
    reasons
  };
}

export function applyKillSwitch(candidates = [], context = {}) {
  return candidates.map((candidate) => ({
    ...candidate,
    killSwitch: evaluateKillSwitch({
      protectedProfit: candidate?.protectedProfit,
      nonceConsistent: context?.nonceConsistent,
      retryTerminal: context?.retryTerminal,
      governanceFreeze: context?.governanceFreeze,
      operatorFreeze: context?.operatorFreeze,
      consecutiveBlocked: context?.consecutiveBlocked,
      maxConsecutiveBlocked: context?.maxConsecutiveBlocked,
      relayFailures: context?.relayFailures,
      maxRelayFailures: context?.maxRelayFailures
    })
  }));
}
