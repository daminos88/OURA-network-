export function resolveWalletGate({ hasSigner = false, armed = false, mainnetEnabled = false, approvalRequired = true } = {}) {
  if (!hasSigner) {
    return { state: "DRY_RUN", signable: false, reason: "no_signer_present" };
  }

  if (!armed || !mainnetEnabled) {
    return { state: "LOCKED", signable: false, reason: "not_armed_or_mainnet_disabled" };
  }

  if (approvalRequired) {
    return { state: "APPROVAL_REQUIRED", signable: false, reason: "human_approval_required" };
  }

  return { state: "SIGNABLE_POLICY_ONLY", signable: true, reason: "policy_clear" };
}

export function probeWalletGate() {
  return [
    resolveWalletGate({ hasSigner: false, armed: false, mainnetEnabled: false, approvalRequired: true }),
    resolveWalletGate({ hasSigner: true, armed: false, mainnetEnabled: false, approvalRequired: true }),
    resolveWalletGate({ hasSigner: true, armed: true, mainnetEnabled: true, approvalRequired: true }),
    resolveWalletGate({ hasSigner: true, armed: true, mainnetEnabled: true, approvalRequired: false })
  ];
}
