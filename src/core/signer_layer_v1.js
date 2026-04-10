export function buildSignerRequest({ relayPlan = {}, attestation = null, chainId = 42161, account = null } = {}) {
  const steps = Array.isArray(relayPlan.dispatchPlan) ? relayPlan.dispatchPlan : [];

  return {
    ok: true,
    request: {
      version: "1.0",
      type: "EXTERNAL_SIGNER_REQUEST",
      chainId,
      account,
      relay: relayPlan.relay ?? "NONE",
      endpointType: relayPlan.endpointType ?? "NONE",
      attestationDigest: attestation?.envelope?.digest ?? null,
      steps: steps.map((step, index) => ({
        order: index + 1,
        txKind: step.txKind,
        target: step.target,
        value: step.value,
        data: step.data,
        gasLimitHint: step.gasLimitHint,
        sendPolicy: step.sendPolicy ?? {}
      }))
    }
  };
}

export function validateSignerResponse(response = {}) {
  const accepted = Boolean(response?.accepted);
  const signatureCount = Number(response?.signatureCount ?? 0);
  const status = accepted && signatureCount > 0 ? "READY_TO_SUBMIT" : "SIGNING_INCOMPLETE";

  return {
    ok: true,
    accepted,
    signatureCount,
    status,
    signerRef: response?.signerRef ?? null
  };
}

export function buildSignedEnvelope({ signerRequest, signerResponse } = {}) {
  const validation = validateSignerResponse(signerResponse);

  return {
    ok: true,
    envelope: {
      type: "SIGNED_EXECUTION_ENVELOPE",
      request: signerRequest?.request ?? null,
      signerResponse: {
        accepted: validation.accepted,
        signatureCount: validation.signatureCount,
        signerRef: validation.signerRef,
        status: validation.status
      }
    }
  };
}
