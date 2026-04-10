import { runGoldenPathV4 } from "./golden_path_v4.js";
import { rerankByTrueExecutableProfit } from "./gas_engine_v1.js";
import { rerankByProtectedProfit } from "./mev_engine_v1.js";
import { applyExecutionGuard } from "./execution_guard_v1.js";
import { applyNonceReservation } from "./nonce_engine_v1.js";
import { applyMempoolStrategyV2 } from "./mempool_engine_v2.js";
import { applyRetryPolicy } from "./execution_retry_v1.js";
import { buildCalldataPlan } from "./calldata_tx_builder_v1.js";
import { applyRelayPlanning } from "./relay_integration_v1.js";
import { buildAttestationEnvelope, buildReplayProof } from "./attestation_engine_v1.js";
import { buildSignerRequest, buildSignedEnvelope } from "./signer_layer_v1.js";
import { applyKillSwitch } from "./kill_switch_v1.js";
import { fetchGasFeedV1 } from "./gas_feed_v1.js";
import { ouraVerdictV2 } from "./oura_engine_v2.js";

export async function runOrchestratedExecutionV2({ rpcUrl, riskConfig = {}, reserveConfig = {}, executionConfig = {} }) {
  const gasFeed = await fetchGasFeedV1({ rpcUrl });

  const base = await runGoldenPathV4({ rpcUrl, riskConfig, reserveConfig });
  if (!base?.ok) return base;

  const baseCandidates = base.reRanked ?? base.ranked ?? [];

  const gasRanked = rerankByTrueExecutableProfit(baseCandidates, {
    gasUnits: executionConfig.gasUnits ?? 250000,
    gasPriceGwei: gasFeed.gasPriceGwei,
    ethPriceUsd: executionConfig.ethPriceUsd ?? null
  });

  const mevRanked = rerankByProtectedProfit(gasRanked, {
    gasPriceGwei: gasFeed.gasPriceGwei,
    priorityFeeGwei: gasFeed.maxPriorityFeePerGasGwei ?? 0.01
  });

  const withOura = mevRanked.map(c => {
    const verdict = ouraVerdictV2(c);
    return { ...c, oura: verdict };
  });

  const guarded = applyExecutionGuard(withOura, {
    governanceAction: base?.governance?.action ?? "UNKNOWN",
    nonceConsistent: true
  });

  const allowed = guarded.filter(c => c.executionGuard?.allow);

  const nonced = applyNonceReservation(allowed, {
    chainNonce: executionConfig.chainNonce ?? 0,
    localNonce: executionConfig.localNonce ?? 0,
    pendingCount: executionConfig.pendingCount ?? 0
  });

  const mempool = applyMempoolStrategyV2(nonced, {
    urgency: executionConfig.urgency ?? 0.8
  });

  const retried = applyRetryPolicy(mempool.map(c => ({ ...c, attempt: 1 })), {
    maxAttempts: 3
  });

  const calldata = retried.map(c => ({
    ...c,
    calldataPlan: buildCalldataPlan({
      amount: c.size,
      amountOutMin: Math.max(0, c.modeledEthBack * 0.99)
    })
  }));

  const relay = applyRelayPlanning(calldata, executionConfig);

  const attested = relay.map(c => {
    const env = buildAttestationEnvelope({ kind: "EXECUTION", payload: c });
    const proof = buildReplayProof({ envelope: env.envelope });
    return { ...c, attestation: env.envelope, replayProof: proof.proof };
  });

  const signed = attested.map(c => {
    const req = buildSignerRequest({ relayPlan: c.relayPlan, chainId: 42161 });
    const env = buildSignedEnvelope({ signerRequest: req, signerResponse: { accepted: true } });
    return { ...c, signedEnvelope: env.envelope };
  });

  const kill = applyKillSwitch(signed, { nonceConsistent: true });

  const finalCandidates = kill.filter(c => !c.killSwitch?.engaged);

  return {
    ok: true,
    gasFeed,
    finalCandidates,
    winner: finalCandidates[0] ?? null
  };
}
