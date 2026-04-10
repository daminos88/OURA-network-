import { scanBestSizeV2 } from "./size_scanner_v2.js";
import { comparePairAcrossRouters } from "./price_compare.js";
import { buildFilteredLiquidityRoutes } from "./reserve_scanner_v2.js";
import { rankSignals } from "./signal_ranker.js";
import { applyRiskToRankedSignals } from "./risk_engine.js";
import { runExecutionDecisionV2 } from "./execution_engine_v2.js";
import { buildRoutePlan } from "./route_builder.js";
import { buildTxPlan } from "./tx_builder.js";
import { buildDecisionLedger } from "./audit_ledger.js";
import { ouraVerdict } from "./oura_engine.js";
import { governanceGate } from "./governance/seal_admiral.js";

function scannerSignal(scan) {
  if (!scan?.best) return null;
  return {
    source: "scanner_v2",
    venue: scan.best.venue,
    path: scan.best.path,
    size: scan.best.size,
    netEth: scan.best.netEth,
    realNet: scan.best.netEth,
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

function toPairDescriptors(candidates = []) {
  return candidates.map((c, i) => ({
    pairAddress: c.pairAddress || [
      "0x905dfCD5649217c42684f23958568e533C711Aa3"
    ][i % 1],
    venue: c.venue,
    tokenPath: Array.isArray(c.path) ? c.path : []
  }));
}

export async function runGoldenPathV3({ rpcUrl, riskConfig = {}, reserveConfig = {} }) {
  const scan = await scanBestSizeV2({ rpcUrl });
  const divergence = await comparePairAcrossRouters({
    rpcUrl,
    pair: ["WETH", "USDC"],
    amountInEth: 0.001
  });

  const rawCandidates = [scannerSignal(scan), divergenceSignal(divergence)].filter(Boolean);
  const pairDescriptors = toPairDescriptors(rawCandidates);

  const reserveRes = await buildFilteredLiquidityRoutes({
    rpcUrl,
    pairDescriptors,
    minWeakestDepth: reserveConfig.minWeakestDepth ?? 100,
    minLiquidityScore: reserveConfig.minLiquidityScore ?? 1
  });

  const candidates = reserveRes.allowed.map((routeObj, idx) => {
    const base = rawCandidates[idx] || {};
    return {
      ...base,
      venue: routeObj.venue || base.venue,
      path: routeObj.path || base.path,
      route: routeObj.route,
      weakestDepth: routeObj.weakestDepth,
      liquidityScore: routeObj.liquidityScore,
      liquidityAllow: routeObj.liquidityAllow,
      reserveSnapshot: routeObj.reserveSnapshot
    };
  });

  const ranked = rankSignals(candidates);
  const riskApplied = applyRiskToRankedSignals(ranked, riskConfig);
  const winner = riskApplied.find((s) => s?.risk?.allow) || null;

  const execution = winner ? runExecutionDecisionV2({ signal: winner }) : null;

  const oura = winner
    ? ouraVerdict({
        netEth: execution?.execution?.realNet ?? winner.realNet ?? 0,
        costs: { totalCost: execution?.execution?.costs?.totalCost ?? 0 },
        size: winner.size ?? 0.001
      })
    : { decision: "REJECT", reason: "no_winner" };

  const governance = governanceGate({
    signal: {
      mode: "GOLDEN_PATH_V3",
      winner,
      ranked,
      riskApplied,
      reserveApplied: reserveRes.allowed,
      execution
    },
    oura,
    metadata: { source: "golden_path_v3" }
  });

  const routePlan = winner ? buildRoutePlan(winner) : null;
  const txPlan = winner ? buildTxPlan(winner) : null;

  const ledger = buildDecisionLedger({
    winner,
    ranked,
    risk: winner?.risk ?? null,
    routePlan,
    txPlan,
    governance
  });

  return {
    ok: true,
    scan,
    divergence,
    reserveApplied: reserveRes.allowed,
    ranked,
    riskApplied,
    winner,
    execution,
    oura,
    governance,
    routePlan,
    txPlan,
    ledger
  };
}
