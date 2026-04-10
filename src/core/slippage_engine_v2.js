import { computeConstantProductOut, estimateTriangularSlippage } from "./slippage_engine.js";

export function buildReserveBackedRouteFromCandidate(candidate) {
  const route = Array.isArray(candidate?.route) ? candidate.route : [];
  return route
    .filter((leg) => Number(leg?.reserveIn) > 0 && Number(leg?.reserveOut) > 0)
    .map((leg) => ({
      reserveIn: Number(leg.reserveIn),
      reserveOut: Number(leg.reserveOut),
      feeBps: Number(leg.feeBps ?? 30)
    }));
}

export function simulateReserveBackedSlippage({ candidate, amountIn }) {
  const route = buildReserveBackedRouteFromCandidate(candidate);

  if (!route.length) {
    return {
      ok: false,
      reason: "no_reserve_backed_route"
    };
  }

  if (route.length === 1) {
    const one = computeConstantProductOut({
      reserveIn: route[0].reserveIn,
      reserveOut: route[0].reserveOut,
      amountIn,
      feeBps: route[0].feeBps
    });

    return {
      ok: Boolean(one.ok),
      mode: "single_leg",
      finalAmountOut: one.amountOut,
      totalPenalty: one.slippagePenalty,
      legs: [one]
    };
  }

  const tri = estimateTriangularSlippage({
    route,
    amountIn
  });

  return {
    ...tri,
    mode: "multi_leg"
  };
}

export function attachRealSlippage(candidate) {
  const amountIn = Number(candidate?.size ?? 0);
  const modeled = simulateReserveBackedSlippage({ candidate, amountIn });

  if (!modeled.ok) {
    return {
      ...candidate,
      slippageModel: modeled,
      modeledEthBack: candidate?.ethBack ?? amountIn,
      modeledRealNet: candidate?.realNet ?? candidate?.netEth ?? 0
    };
  }

  const modeledEthBack = Number(modeled.finalAmountOut ?? amountIn);
  const modeledRealNet = modeledEthBack - amountIn;

  return {
    ...candidate,
    slippageModel: modeled,
    modeledEthBack,
    modeledRealNet
  };
}
