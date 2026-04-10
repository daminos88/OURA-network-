export function classifyExecutionFailure({ errorType = "UNKNOWN" } = {}) {
  const t = String(errorType).toUpperCase();

  if (["RELAY_REJECT", "PRIVATE_RELAY_REJECT"].includes(t)) return "RELAY_REJECT";
  if (["TIMEOUT", "INCLUSION_TIMEOUT"].includes(t)) return "TIMEOUT";
  if (["NOT_INCLUDED", "DROPPED"].includes(t)) return "NOT_INCLUDED";
  if (["REPLACED", "UNDERPRICED_REPLACEMENT"].includes(t)) return "REPLACED";
  if (["NONCE_CONFLICT", "NONCE_TOO_LOW", "NONCE_EXPIRED"].includes(t)) return "NONCE_CONFLICT";
  return "UNKNOWN";
}

export function decideRetryPolicy({
  errorType = "UNKNOWN",
  attempt = 1,
  maxAttempts = 3,
  baseBackoffMs = 500,
  priorityBumpBps = 500
} = {}) {
  const failure = classifyExecutionFailure({ errorType });
  const terminal = attempt >= maxAttempts;

  let action = "ABORT";
  let reason = failure;
  let nextAttempt = attempt;
  let backoffMs = 0;
  let bumpBps = 0;

  if (!terminal) {
    if (failure === "TIMEOUT" || failure === "NOT_INCLUDED") {
      action = "RETRY";
      nextAttempt = attempt + 1;
      backoffMs = baseBackoffMs * attempt;
    } else if (failure === "REPLACED") {
      action = "REPRICE";
      nextAttempt = attempt + 1;
      bumpBps = priorityBumpBps;
      backoffMs = baseBackoffMs;
    } else if (failure === "RELAY_REJECT") {
      action = "REBUNDLE";
      nextAttempt = attempt + 1;
      bumpBps = Math.floor(priorityBumpBps / 2);
      backoffMs = baseBackoffMs * 2;
    } else if (failure === "NONCE_CONFLICT") {
      action = "ABORT";
      reason = "nonce_conflict_terminal";
    }
  } else {
    action = "ABORT";
    reason = `${failure}_max_attempts`;
  }

  return {
    ok: true,
    failure,
    action, // RETRY | REPRICE | REBUNDLE | ABORT
    reason,
    attempt,
    nextAttempt,
    backoffMs,
    bumpBps,
    terminal: action === "ABORT"
  };
}

export function applyRetryPolicy(events = [], config = {}) {
  return events.map((e) => ({
    ...e,
    retry: decideRetryPolicy({
      errorType: e.errorType,
      attempt: e.attempt ?? 1,
      maxAttempts: config.maxAttempts ?? 3,
      baseBackoffMs: config.baseBackoffMs ?? 500,
      priorityBumpBps: config.priorityBumpBps ?? 500
    })
  }));
}
