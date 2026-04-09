import { ouraVerdict } from "./oura_engine.js";
import { governanceGate } from "./governance/seal_admiral.js";
import { estimateTriangularSlippage } from "./slippage_engine.js";

function buildRouteFromSignal(signal) {
  const provided = Array.isArray(signal?.route) ? signal.route : null;
  if (provided && provided.length) return provided;

  return [
    { reserveIn: 100, reserveOut: 200, feeBps: 30 },
    { reserveIn: 200, reserveOut: 150, feeBps: 30 },
    { reserveIn: 150, reserveOut: 110, feeBps: 30 }
  ];
}

export function simulateExecutionV2({ signal }) {
  const size = signal?.size ?? 0.001;
  const netEth = signal?.netEth ?? 0;
  const ethBack = signal?.ethBack ?? size;

  const gasCost = 0.00015;
  const executionBuffer = 0.00005;

  const route = buildRouteFromSignal(signal);
  const slip = estimateTriangularSlippage({ route, amountIn: size });

  const slippagePenalty = slip.ok ? slip.totalPenalty : 0;

  const costs = {
    gasCost,
    executionBuffer,
    slippagePenalty,
    totalCost: gasCost + executionBuffer + slippagePenalty,
    slippageModel: slip.ok ? slip : { ok: false, reason: slip.reason || "slippage_failed" }
  };

  const modeledEthBack = slip.ok ? slip.finalAmountOut : ethBack;
  const realizedEdge = modeledEthBack - size + netEth;
  const realNet = realizedEdge - costs.totalCost;

  return {
    ok: true,
    signal,
    costs,
    modeledEthBack,
    realizedEdge,
    realNet,
    executable: realNet > 0
  };
}

export function runExecutionDecisionV2({ signal }) {
  const execution = simulateExecutionV2({ signal });

  const oura = ouraVerdict({
    netEth: execution.realNet,
    costs: { totalCost: execution.costs.totalCost },
    size: signal?.size ?? 0.001
  });

  const gate = governanceGate({
    signal: {
      ...signal,
      realNet: execution.realNet,
      executionCosts: execution.costs,
      modeledEthBack: execution.modeledEthBack,
      realizedEdge: execution.realizedEdge
    },
    oura,
    metadata: { source: "execution_engine_v2" }
  });

  let action = "BLOCK";
  if (execution.executable && oura.decision === "ACCEPT" && gate.action === "ESCALATE_TO_SEAL") {
    action = "READY_FOR_SEAL";
  }

  return {
    ok: true,
    execution,
    oura,
    governance: gate,
    action
  };
}
