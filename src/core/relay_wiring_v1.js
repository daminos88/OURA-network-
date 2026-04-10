export function buildRelayEndpointPlan({ mempool = {}, config = {} } = {}) {
  const mode = String(mempool?.mode ?? "ABORT");

  const publicRpcUrl = config.publicRpcUrl ?? null;
  const privateRelayUrl = config.privateRelayUrl ?? null;
  const bundleRelayUrl = config.bundleRelayUrl ?? null;

  if (mode === "ABORT") {
    return {
      ok: true,
      enabled: false,
      endpointType: "NONE",
      endpointUrl: null,
      mode,
      reason: mempool?.reason ?? "abort_mode"
    };
  }

  if (mode === "PUBLIC") {
    return {
      ok: true,
      enabled: Boolean(publicRpcUrl),
      endpointType: "PUBLIC_RPC",
      endpointUrl: publicRpcUrl,
      mode,
      reason: mempool?.reason ?? "public_mode"
    };
  }

  if (mode === "PRIVATE") {
    return {
      ok: true,
      enabled: Boolean(privateRelayUrl),
      endpointType: "PRIVATE_RELAY",
      endpointUrl: privateRelayUrl,
      mode,
      reason: mempool?.reason ?? "private_mode"
    };
  }

  if (mode === "BUNDLE") {
    return {
      ok: true,
      enabled: Boolean(bundleRelayUrl),
      endpointType: "BUNDLE_RELAY",
      endpointUrl: bundleRelayUrl,
      mode,
      reason: mempool?.reason ?? "bundle_mode"
    };
  }

  return {
    ok: true,
    enabled: false,
    endpointType: "UNKNOWN",
    endpointUrl: null,
    mode,
    reason: "unknown_mode"
  };
}

export function applyRelayWiring(candidates = [], config = {}) {
  return candidates.map((candidate) => ({
    ...candidate,
    relayEndpoint: buildRelayEndpointPlan({
      mempool: candidate?.mempool,
      config
    })
  }));
}
