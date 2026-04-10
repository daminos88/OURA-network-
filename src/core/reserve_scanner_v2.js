import { fetchManyPairReserves } from "./real_reserve_fetch.js";
import { estimateReserveDepth, scoreRouteLiquidity } from "./reserve_scanner.js";

function snapshotToRouteObject(snapshot, descriptor = {}) {
  if (!snapshot?.ok) {
    return {
      ok: false,
      pairAddress: descriptor.pairAddress || snapshot?.pairAddress,
      venue: descriptor.venue || "UNKNOWN",
      path: descriptor.tokenPath || [],
      reason: snapshot?.reason || "snapshot_failed"
    };
  }

  const reserveIn = snapshot.reserve0;
  const reserveOut = snapshot.reserve1;
  const depth = estimateReserveDepth({ reserveIn, reserveOut });
  const liquidity = scoreRouteLiquidity([
    {
      reserveIn,
      reserveOut
    }
  ]);

  return {
    ok: true,
    pairAddress: snapshot.pairAddress,
    venue: descriptor.venue || "UNKNOWN",
    path: descriptor.tokenPath || [snapshot.token0Symbol, snapshot.token1Symbol],
    route: [
      {
        reserveIn,
        reserveOut,
        tokenIn: snapshot.token0Symbol,
        tokenOut: snapshot.token1Symbol
      }
    ],
    reserveSnapshot: snapshot,
    weakestDepth: liquidity.weakestDepth,
    liquidityScore: liquidity.liquidityScore,
    liquidityAllow: liquidity.ok,
    depth
  };
}

export async function buildLiquidityScoredRoutes({ rpcUrl, pairDescriptors = [] }) {
  const pairAddresses = pairDescriptors.map((x) => x.pairAddress);
  const fetched = await fetchManyPairReserves({ rpcUrl, pairAddresses });

  const routes = fetched.results.map((snapshot, idx) =>
    snapshotToRouteObject(snapshot, pairDescriptors[idx] || {})
  );

  return {
    ok: true,
    routes
  };
}

export async function buildFilteredLiquidityRoutes({ rpcUrl, pairDescriptors = [], minWeakestDepth = 100, minLiquidityScore = 1 }) {
  const res = await buildLiquidityScoredRoutes({ rpcUrl, pairDescriptors });

  const routes = res.routes.map((route) => ({
    ...route,
    liquidityAllow: Boolean(route.ok)
      && (route.weakestDepth ?? 0) >= minWeakestDepth
      && (route.liquidityScore ?? 0) >= minLiquidityScore
  }));

  return {
    ok: true,
    routes,
    allowed: routes.filter((r) => r.liquidityAllow)
  };
}
