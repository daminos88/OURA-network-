import { ouraVerdict } from "./oura_engine.js";
import { governanceGate } from "./governance/seal_admiral.js";

export function simulateExecution({ signal }) {
  const size = signal?.size ?? 0.001;
  const netEth = signal?.netEth ?? 0;
  const ethBack = signal?.ethBack ?? size;

  const gasCost = 0.00015;
  const executionBuffer = 0.00005;
  const slippagePenalty = Math.max(0, size * 0.002);

  const costs = {
    gasCost,
    executionBuffer,
    slippagePenalty,
    totalCost: gasCost + executionBuffer + slippagePenalty
  };

  const realNet = netEth - costs.totalCost;

  return {
    ok: true,
    signal,
    costs,
    realNet,
    executable: realNet > 0
  };
}

export function runExecutionDecision({ signal }) {
  const execution = simulateExecution({ signal });

  const oura = ouraVerdict({
    netEth: execution.realNet,
    costs: { totalCost: execution.costs.totalCost },
    size: signal?.size ?? 0.001
  });

  const gate = governanceGate({
    signal: {
      ...signal,
      realNet: execution.realNet,
      executionCosts: execution.costs
    },
    oura,
    metadata: { source: "execution_engine" }
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
