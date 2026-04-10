import { runGoldenPathV4 } from "./golden_path_v4.js";
import { rerankByTrueExecutableProfit } from "./gas_engine_v1.js";
import { rerankByProtectedProfit } from "./mev_engine_v1.js";
import { applyExecutionGuard } from "./execution_guard_v1.js";
import { applyNonceReservation } from "./nonce_engine_v1.js";
import { applyMempoolStrategyV2 } from "./mempool_engine_v2.js";
import { applyRetryPolicy } from "./execution_retry_v1.js";
import { buildCalldataPlan } from "./calldata_tx_builder_v1.js";
import { applyRelayPlanning } from "./relay_integration_v1.js";
import { applyRelayWiring } from "./relay_wiring_v1.js";
import { buildAttestationEnvelope, buildReplayProof } from "./attestation_engine_v1.js";
import { buildSignerRequest, buildSignedEnvelope } from "./signer_layer_v1.js";
import { applyKillSwitch } from "./kill_switch_v1.js";
import { fetchGasFeedV1 } from "./gas_feed_v1.js";
import { ouraVerdictV4 } from "./oura_engine_v4.js";
import { calibrateOuraV2 } from "./oura_calibration_v2.js";

function withSafeMinOut(candidate, config = {}) {
  const modeledEthBack = Number(candidate?.modeledEthBack ?? candidate?.ethBack ?? candidate?.size ?? 0);
  const slippageFloorBps = Number(config.slippageFloorBps ?? 100);
  const amountOutMin = modeledEthBack * (1 - slippageFloorBps / 10000);
  return { ...candidate, amountOutMin: Math.max(0, amountOutMin) };
}

function attachCalldata(candidate, config = {}) {
  const pathAddrs = Array.isArray(config.pathAddresses) ? config.pathAddresses : ["0xTokenA", "0xTokenB"];
  const token = String(config.token ?? pathAddrs[0] ?? "0xTokenA");
  const router = String(config.router ?? "0xRouterAddress");
  const to = String(config.to ?? "0xYourAddress");
  const deadline = Number(config.deadline ?? Math.floor(Date.now() / 1000) + 300);

  const calldataPlan = buildCalldataPlan({
    token,
    spender: router,
    amount: Number(candidate?.size ?? 0),
    router,
    amountOutMin: Number(candidate?.amountOutMin ?? 0),
    path: pathAddrs,
    to,
    deadline,
    decimals: Number(config.decimals ?? 18)
  });

  return { ...candidate, calldataPlan };
}

function attachAttestation(candidate) {
  const payload = {
    venue: candidate?.venue,
    path: candidate?.path,
    protectedProfit: candidate?.protectedProfit,
    nonceReservation: candidate?.nonceReservation,
    mempool: candidate?.mempool,
    relayEndpoint: candidate?.relayEndpoint,
    calldataPlan: candidate?.calldataPlan,
    oura: candidate?.oura
  };

  const envelopeRes = buildAttestationEnvelope({ kind: "EXECUTION_PLAN", payload });
  const proofRes = buildReplayProof({ envelope: envelopeRes.envelope });

  return {
    ...candidate,
    attestation: envelopeRes.envelope,
    replayProof: proofRes.proof
  };
}

function attachSigning(candidate, config = {}) {
  const relayWrapped = {
    relay: candidate?.relayPlan?.relay ?? "NONE",
    endpointType: candidate?.relayPlan?.endpointType ?? "NONE",
    dispatchPlan: candidate?.relayPlan?.dispatchPlan ?? []
  };

  const signerReq = buildSignerRequest({
    relayPlan: relayWrapped,
    attestation: { envelope: candidate?.attestation },
    chainId: Number(config.chainId ?? 42161),
    account: config.account ?? "0xYourAddress"
  });

  const mockSignerResponse = {
    accepted: true,
    signatureCount: Array.isArray(candidate?.relayPlan?.dispatchPlan) ? candidate.relayPlan.dispatchPlan.length : 0,
    signerRef: "external-signer-placeholder"
  };

  const signedEnvelope = buildSignedEnvelope({
    signerRequest: signerReq,
    signerResponse: mockSignerResponse
  });

  return {
    ...candidate,
    signerRequest: signerReq,
    signedEnvelope: signedEnvelope.envelope
  };
}

export async function runOrchestratedExecutionV4({ rpcUrl, riskConfig = {}, reserveConfig = {}, executionConfig = {}, calibrationHistory = [] }) {
  const gasFeed = await fetchGasFeedV1({ rpcUrl });
  const calibration = calibrateOuraV2({ history: calibrationHistory });

  const base = await runGoldenPathV4({ rpcUrl, riskConfig, reserveConfig });
  if (!base?.ok) return base;

  const baseCandidates = Array.isArray(base.reRanked) && base.reRanked.length ? base.reRanked : (Array.isArray(base.ranked) ? base.ranked : []);

  const gasRanked = rerankByTrueExecutableProfit(baseCandidates, {
    gasUnits: executionConfig.gasUnits ?? 250000,
    gasPriceGwei: gasFeed.gasPriceGwei,
    ethPriceUsd: executionConfig.ethPriceUsd ?? null
  });

  const mevRanked = rerankByProtectedProfit(gasRanked, {
    gasPriceGwei: gasFeed.gasPriceGwei,
    priorityFeeGwei: gasFeed.maxPriorityFeePerGasGwei ?? 0.01
  });

  const withOura = mevRanked.map((candidate) => ({
    ...candidate,
    oura: ouraVerdictV4(candidate, calibration)
  }));

  const ouraAllowed = withOura.filter((c) => {
    const d = c?.oura?.decision;
    return d === "ACCEPT" || d === "DECAY" || d === "CONTAMINATED";
  });

  const guarded = applyExecutionGuard(ouraAllowed, {
    governanceAction: base?.governance?.action ?? "UNKNOWN",
    nonceConsistent: true
  });

  const allowed = guarded.filter((c) => c?.executionGuard?.allow);

  const nonced = applyNonceReservation(allowed, {
    chainNonce: executionConfig.chainNonce ?? 0,
    localNonce: executionConfig.localNonce ?? executionConfig.chainNonce ?? 0,
    pendingCount: executionConfig.pendingCount ?? 0
  });

  const mempool = applyMempoolStrategyV2(nonced, {
    urgency: executionConfig.urgency ?? 0.8
  });

  const retryWrapped = mempool.map((c) => ({
    ...c,
    errorType: executionConfig.initialErrorType ?? "TIMEOUT",
    attempt: 1
  }));

  const retried = applyRetryPolicy(retryWrapped, {
    maxAttempts: executionConfig.maxAttempts ?? 3,
    baseBackoffMs: executionConfig.baseBackoffMs ?? 500,
    priorityBumpBps: executionConfig.priorityBumpBps ?? 500
  });

  const safeMinOut = retried.map((c) => withSafeMinOut(c, executionConfig));
  const withCalldata = safeMinOut.map((c) => attachCalldata(c, executionConfig));
  const relayPlanned = applyRelayPlanning(withCalldata, executionConfig);
  const relayWired = applyRelayWiring(relayPlanned, executionConfig);
  const attested = relayWired.map((c) => attachAttestation(c));
  const signed = attested.map((c) => attachSigning(c, executionConfig));

  const killWrapped = applyKillSwitch(signed, {
    nonceConsistent: true,
    retryTerminal: false,
    governanceFreeze: Boolean(executionConfig.governanceFreeze),
    operatorFreeze: Boolean(executionConfig.operatorFreeze),
    consecutiveBlocked: executionConfig.consecutiveBlocked ?? 0,
    maxConsecutiveBlocked: executionConfig.maxConsecutiveBlocked ?? 3,
    relayFailures: executionConfig.relayFailures ?? 0,
    maxRelayFailures: executionConfig.maxRelayFailures ?? 3
  });

  const finalCandidates = killWrapped.filter((c) => !c?.killSwitch?.engaged);
  const winner = finalCandidates[0] || null;

  return {
    ok: true,
    gasFeed,
    calibration,
    base,
    gasRanked,
    mevRanked,
    withOura,
    ouraAllowed,
    guarded,
    nonced,
    mempool,
    retried,
    safeMinOut,
    withCalldata,
    relayPlanned,
    relayWired,
    attested,
    signed,
    killWrapped,
    finalCandidates,
    winner
  };
}
