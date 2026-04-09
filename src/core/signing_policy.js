export function resolveSigningPolicy({ hasSigner = false, approvalRequired = true, signingEnabled = false } = {}) {
  if (!hasSigner) {
    return { state: "DRY_RUN", canSign: false, reason: "no_signer_present" };
  }

  if (!signingEnabled) {
    return { state: "SIGNING_DISABLED", canSign: false, reason: "signing_disabled" };
  }

  if (approvalRequired) {
    return { state: "APPROVAL_REQUIRED", canSign: false, reason: "human_approval_required" };
  }

  return { state: "READY_TO_SIGN", canSign: true, reason: "policy_clear" };
}

export function probeSigningPolicy() {
  return [
    resolveSigningPolicy({ hasSigner: false, approvalRequired: true, signingEnabled: false }),
    resolveSigningPolicy({ hasSigner: true, approvalRequired: true, signingEnabled: true }),
    resolveSigningPolicy({ hasSigner: true, approvalRequired: false, signingEnabled: false }),
    resolveSigningPolicy({ hasSigner: true, approvalRequired: false, signingEnabled: true })
  ];
}
