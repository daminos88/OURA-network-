import { runOrchestratedExecutionV1 } from "./orchestrated_execution_v1.js";

export async function prepareTradeBundleV2({ rpcUrl, riskConfig = {}, reserveConfig = {}, executionConfig = {} }) {
  const res = await runOrchestratedExecutionV1({
    rpcUrl,
    riskConfig,
    reserveConfig,
    executionConfig
  });

  const winner = res?.winner ?? null;
  const signedEnvelope = winner?.signedEnvelope ?? null;
  const relayPlan = winner?.relayPlan ?? null;
  const attestation = winner?.attestation ?? null;
  const replayProof = winner?.replayProof ?? null;
  const killSwitch = winner?.killSwitch ?? null;

  return {
    ok: true,
    winner: Boolean(winner),
    bundle: winner
      ? {
          signedEnvelope,
          relayPlan,
          attestation,
          replayProof,
          killSwitch
        }
      : null,
    orchestration: res
  };
}
