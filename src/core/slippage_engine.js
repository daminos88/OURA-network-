export function computeConstantProductOut({ reserveIn, reserveOut, amountIn, feeBps = 30 }) {
  if (reserveIn <= 0 || reserveOut <= 0 || amountIn <= 0) {
    return {
      ok: false,
      reason: "invalid_inputs"
    };
  }

  const feeMultiplier = (10000 - feeBps) / 10000;
  const amountInAfterFee = amountIn * feeMultiplier;

  const numerator = amountInAfterFee * reserveOut;
  const denominator = reserveIn + amountInAfterFee;
  const amountOut = numerator / denominator;

  const spotPrice = reserveOut / reserveIn;
  const effectivePrice = amountOut / amountIn;
  const priceImpact = spotPrice > 0 ? (spotPrice - effectivePrice) / spotPrice : 0;
  const slippagePenalty = Math.max(0, amountIn * priceImpact);

  return {
    ok: true,
    amountOut,
    spotPrice,
    effectivePrice,
    priceImpact,
    slippagePenalty,
    feeBps
  };
}

export function estimateTriangularSlippage({ route, amountIn }) {
  if (!Array.isArray(route) || route.length === 0) {
    return { ok: false, reason: "invalid_route" };
  }

  let currentIn = amountIn;
  let totalPenalty = 0;
  const legs = [];

  for (const leg of route) {
    const res = computeConstantProductOut({
      reserveIn: leg.reserveIn,
      reserveOut: leg.reserveOut,
      amountIn: currentIn,
      feeBps: leg.feeBps ?? 30
    });

    if (!res.ok) return res;

    legs.push(res);
    totalPenalty += res.slippagePenalty;
    currentIn = res.amountOut;
  }

  return {
    ok: true,
    finalAmountOut: currentIn,
    totalPenalty,
    legs
  };
}
