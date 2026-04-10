export function evaluateNonceState({ chainNonce = 0, localNonce = 0, pendingCount = 0 } = {}) {
  const chain = Number(chainNonce);
  const local = Number(localNonce);
  const pending = Number(pendingCount);

  const nextExpectedNonce = Math.max(chain, local);
  const drift = local - chain;
  const gap = Math.max(0, local - chain - pending);
  const consistent = gap === 0 && drift >= 0;

  return {
    ok: true,
    chainNonce: chain,
    localNonce: local,
    pendingCount: pending,
    nextExpectedNonce,
    drift,
    gap,
    consistent
  };
}

export function reserveNextNonce(state = {}) {
  const evaluated = evaluateNonceState(state);
  return {
    ...evaluated,
    reservedNonce: evaluated.nextExpectedNonce,
    nextLocalNonce: evaluated.nextExpectedNonce + 1
  };
}

export function applyNonceReservation(candidates = [], state = {}) {
  let local = Number(state.localNonce ?? state.chainNonce ?? 0);
  const chain = Number(state.chainNonce ?? 0);
  const pending = Number(state.pendingCount ?? 0);

  return candidates.map((candidate) => {
    const reservation = reserveNextNonce({
      chainNonce: chain,
      localNonce: local,
      pendingCount: pending
    });
    local = reservation.nextLocalNonce;

    return {
      ...candidate,
      nonceReservation: reservation
    };
  });
}
