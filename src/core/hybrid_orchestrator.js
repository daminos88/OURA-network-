import { scanBestSize } from "./size_scanner.js";
import { comparePairAcrossRouters } from "./price_compare.js";
import { ouraVerdict } from "./oura_engine.js";
import { governanceGate } from "./governance/seal_admiral.js";

export async function runHybridOrchestrator({ rpcUrl }) {
  const scan = await scanBestSize({ rpcUrl });
  const divergence = await comparePairAcrossRouters({
    rpcUrl,
    pair: ["WETH", "USDC"],
    amountInEth: 0.001
  });

  const signal = {
    mode: "HYBRID",
    scanner: scan.best || null,
    divergence: divergence.bestEdge || null
  };

  let netEth = 0;
  let size = 0.001;
  let costs = { totalCost: 0 };

  if (scan?.best) {
    netEth = scan.best.netEth ?? 0;
    size = scan.best.size ?? size;
    costs = {
      totalCost: Math.max(0, (scan.best.size ?? 0) - (scan.best.ethBack ?? 0))
    };
  } else if (divergence?.bestEdge) {
    netEth = Math.abs(divergence.bestEdge.spread) * 0.000001;
    size = 0.001;
    costs = { totalCost: 0.0000005 };
  }

  const oura = ouraVerdict({ netEth, costs, size });

  const gate = governanceGate({
    signal,
    oura,
    metadata: { source: "hybrid_orchestrator" }
  });

  return {
    ok: true,
    scan,
    divergence,
    oura,
    governance: gate
  };
}
