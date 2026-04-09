import { scanBestSize } from "./size_scanner.js";
import { comparePairAcrossRouters } from "./price_compare.js";
import { ouraVerdict } from "./oura_engine.js";
import { governanceGate } from "./governance/seal_admiral.js";
import { rankSignals } from "./signal_ranker.js";

function scannerSignal(scan) {
  if (!scan?.best) return null;
  return {
    source: "scanner",
    venue: scan.best.venue,
    path: scan.best.path,
    size: scan.best.size,
    netEth: scan.best.netEth,
    realNet: scan.best.realNet ?? scan.best.netEth,
    ethBack: scan.best.ethBack
  };
}

function divergenceSignal(divergence) {
  if (!divergence?.bestEdge) return null;
  const edge = divergence.bestEdge;
  const pseudoRealNet = Math.abs(edge.spread) * 0.000001;
  return {
    source: "divergence",
    venue: `${edge.a}->${edge.b}`,
    path: [edge.pair],
    size: 0.001,
    netEth: pseudoRealNet,
    realNet: pseudoRealNet,
    ethBack: 0.001 + pseudoRealNet
  };
}

export async function runHybridOrchestratorV2({ rpcUrl }) {
  const scan = await scanBestSize({ rpcUrl });
  const divergence = await comparePairAcrossRouters({
    rpcUrl,
    pair: ["WETH", "USDC"],
    amountInEth: 0.001
  });

  const candidates = [
    scannerSignal(scan),
    divergenceSignal(divergence)
  ].filter(Boolean);

  const ranked = rankSignals(candidates);
  const winner = ranked[0] || null;

  let netEth = 0;
  let size = 0.001;
  let costs = { totalCost: 0 };

  if (winner) {
    netEth = winner.realNet ?? winner.netEth ?? 0;
    size = winner.size ?? size;
    costs = {
      totalCost: Math.max(0, (winner.size ?? 0) - (winner.ethBack ?? winner.size ?? 0))
    };
  }

  const oura = ouraVerdict({ netEth, costs, size });

  const gate = governanceGate({
    signal: {
      mode: "HYBRID_V2",
      winner,
      ranked
    },
    oura,
    metadata: { source: "hybrid_orchestrator_v2" }
  });

  return {
    ok: true,
    scan,
    divergence,
    ranked,
    winner,
    oura,
    governance: gate
  };
}
