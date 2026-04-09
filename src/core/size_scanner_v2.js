import { getMultiRouterSurfaceV2 } from "./router_quote_v2.js";

const SIZE_GRID = [0.0005, 0.001, 0.0025, 0.005];

export async function scanBestSizeV2({ rpcUrl }) {
  const runs = await Promise.all(
    SIZE_GRID.map(async (size) => {
      const res = await getMultiRouterSurfaceV2({ rpcUrl, amountInEth: size });
      if (!res.ok || !res.best) return null;

      return {
        size,
        venue: res.best.venue,
        path: res.best.path,
        ethStart: res.best.ethStart,
        ethBack: res.best.ethBack,
        netEth: res.best.netEth
      };
    })
  );

  const valid = runs.filter(Boolean);
  if (!valid.length) return { ok: true, best: null };

  const best = [...valid].sort((a, b) => b.netEth - a.netEth)[0];
  return { ok: true, best, all: valid };
}
