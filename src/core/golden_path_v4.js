import { runGoldenPathV3 } from "./golden_path_v3.js";
import { attachRealSlippage } from "./slippage_engine_v2.js";

export async function runGoldenPathV4({ rpcUrl, riskConfig = {}, reserveConfig = {} }) {
  const base = await runGoldenPathV3({ rpcUrl, riskConfig, reserveConfig });

  if (!base.ok) return base;

  const slippageApplied = (base.ranked || []).map((c) => attachRealSlippage(c));

  const reRanked = slippageApplied
    .map((c) => ({
      ...c,
      finalScore: Number(c.modeledRealNet ?? 0)
    }))
    .sort((a, b) => b.finalScore - a.finalScore);

  const winner = reRanked.find((c) => (c.modeledRealNet ?? 0) > 0) || null;

  return {
    ...base,
    slippageApplied,
    reRanked,
    winner
  };
}
