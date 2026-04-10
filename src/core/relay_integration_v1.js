export function planRelayDispatch(candidate = {}, config = {}) {
  const mempool = candidate?.mempool ?? {};
  const retry = candidate?.retry ?? {};
  const calldataPlan = candidate?.calldataPlan ?? { steps: [] };

  const mode = String(mempool.mode ?? "ABORT");
  const retryAction = String(retry.action ?? "ABORT");

  let relay = "NONE";
  let endpointType = "NONE";

  if (mode === "PUBLIC") {
    relay = "PUBLIC_RPC";
    endpointType = "rpc";
  } else if (mode === "PRIVATE") {
    relay = "PRIVATE_RELAY";
    endpointType = "private";
  } else if (mode === "BUNDLE") {
    relay = "BUNDLE_RELAY";
    endpointType = "bundle";
  }

  if (mode === "ABORT") {
    return {
      ok: true,
      send: false,
      relay,
      endpointType,
      reason: mempool.reason ?? "abort_mode",
      dispatchPlan: []
    };
  }

  const dispatchPlan = (calldataPlan.steps || []).map((step, index) => ({
    order: index + 1,
    relay,
    endpointType,
    txKind: step.txKind,
    target: step.target,
    value: step.value,
    data: step.data,
    gasLimitHint: step.gasLimitHint,
    sendPolicy: {
      retryAction,
      maxBlockDelay: mempool?.params?.maxBlockDelay ?? 0,
      useFlashbots: Boolean(mempool?.params?.useFlashbots),
      usePrivateRelay: Boolean(mempool?.params?.usePrivateRelay)
    }
  }));

  return {
    ok: true,
    send: true,
    relay,
    endpointType,
    reason: mempool.reason ?? "planned",
    dispatchPlan
  };
}

export function applyRelayPlanning(candidates = [], config = {}) {
  return candidates.map((candidate) => ({
    ...candidate,
    relayPlan: planRelayDispatch(candidate, config)
  }));
}
