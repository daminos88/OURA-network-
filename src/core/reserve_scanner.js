export function estimateReserveDepth({ reserveIn = 0, reserveOut = 0 }) {
  const depth = Math.min(Number(reserveIn) || 0, Number(reserveOut) || 0);
  return {
    ok: depth > 0,
    depth,
    liquidityScore: depth > 0 ? Math.log10(depth + 1) : 0
  };
}

export function scoreRouteLiquidity(route = []) {
  if (!Array.isArray(route) || route.length === 0) {
    return { ok: false, reason: "invalid_route", liquidityScore: 0, weakestDepth: 0 };
  }

  const legs = route.map((leg) => estimateReserveDepth({
    reserveIn: leg.reserveIn,
    reserveOut: leg.reserveOut
  }));

  const weakestDepth = Math.min(...legs.map((x) => x.depth || 0));
  const liquidityScore = legs.length
    ? legs.reduce((acc, x) => acc + (x.liquidityScore || 0), 0) / legs.length
    : 0;

  return {
    ok: weakestDepth > 0,
    weakestDepth,
    liquidityScore,
    legs
  };
}

export function filterWeakRoutes(routes = [], { minWeakestDepth = 100, minLiquidityScore = 1 } = {}) {
  return routes.map((route) => {
    const liquidity = scoreRouteLiquidity(route.route || []);
    const allow = Boolean(liquidity.ok)
      && liquidity.weakestDepth >= minWeakestDepth
      && liquidity.liquidityScore >= minLiquidityScore;

    return {
      ...route,
      liquidity,
      liquidityAllow: allow
    };
  });
}
