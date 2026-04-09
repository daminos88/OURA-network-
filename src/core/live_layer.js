import { runHybridOrchestrator } from "./hybrid_orchestrator.js";
import { runExecutionDecision } from "./execution_engine.js";

export async function runLiveLayer({ rpcUrl }) {
  const hybrid = await runHybridOrchestrator({ rpcUrl });

  const signal = hybrid?.scan?.best || {
    venue: "NONE",
    path: [],
    size: 0.001,
    netEth: 0,
    ethBack: 0.001
  };

  const execution = runExecutionDecision({ signal });

  let state = "MONITOR";

  if (execution.action === "READY_FOR_SEAL") {
    state = "READY_FOR_SEAL";
  } else if (execution.execution?.realNet > 0 && hybrid?.oura?.decision === "ACCEPT") {
    state = "HOLD";
  } else {
    state = "MONITOR";
  }

  return {
    ok: true,
    hybrid,
    execution,
    state
  };
}
