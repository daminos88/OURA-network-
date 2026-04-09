// OURA CORE ENGINE — PHASE 4A (SAFE SIDECAR)

export function ouraVerdict({ netEth, costs, size }) {
  const safeSize = size || 1e-9;

  const Ξ = Math.abs(netEth) / safeSize;          // entropy
  const Φ = netEth > 0 ? 1 : 0;                   // fidelity
  const Ψ = Math.exp(-Ξ * 10);                    // coherence
  const ε = (costs?.totalCost || 0) / safeSize;   // drift

  if (Φ === 0) {
    return { decision: "REJECT", reason: "negative_edge", Ξ, Ψ, ε };
  }

  if (Ψ < 0.2) {
    return { decision: "REJECT", reason: "low_coherence", Ξ, Ψ, ε };
  }

  if (ε > 0.8) {
    return { decision: "REJECT", reason: "cost_drift", Ξ, Ψ, ε };
  }

  return {
    decision: "ACCEPT",
    confidence: Ψ,
    entropy: Ξ,
    drift: ε
  };
}
