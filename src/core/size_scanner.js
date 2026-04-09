import { getMultiRouterSurface } from "./router_quote.js";

const SIZES = [0.001, 0.0025, 0.005];

const MIN_SIGNAL = 0.00001;
const GAS_COST = 0.00015;
const EXECUTION_BUFFER = 0.00005;

function isValidRoute(venue) {
  const parts = venue.split("->");
  const unique = new Set(parts);
  return unique.size >= 2;
}

export async function scanBestSize({ rpcUrl }) {
  let best = null;

  for (const size of SIZES) {
    try {
      const res = await getMultiRouterSurface({
        rpcUrl,
        amountInEth: size
      });

      if (!res?.quotes?.length) continue;

      for (const q of res.quotes) {
        if (!isValidRoute(q.venue)) continue;
        if (q.netEth < MIN_SIGNAL) continue;

        const realNet = q.netEth - GAS_COST - EXECUTION_BUFFER;

        if (!best || realNet > best.realNet) {
          best = {
            size,
            venue: q.venue,
            path: q.path,
            netEth: q.netEth,
            realNet,
            ethBack: q.ethBack
          };
        }
      }
    } catch {
      continue;
    }
  }

  if (!best) {
    return {
      ok: true,
      viable: false,
      reason: "no_signal_after_costs",
      best: null
    };
  }

  return {
    ok: true,
    viable: best.realNet > 0,
    best
  };
}
