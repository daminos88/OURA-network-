export function ouraDecisionV2(state = {}, config = {}) {
  const {
    K = 0,
    G = 0,
    Omega = 0,
    XiDot = 0,
    Pi = 0,
    Eta = 0,
    Sigma = 0
  } = state;

  const {
    kappaMax = 0.8,
    gammaMin = 0.01,
    decayThreshold = 0.001,
    contaminationThreshold = 0.5,
    sigmaMin = 0.01,
    omegaMax = Number.POSITIVE_INFINITY
  } = config;

  // Structural blockers first
  if (Sigma < sigmaMin) return "REJECT";
  if (K > kappaMax) return "REJECT";
  if (Omega > omegaMax) return "REJECT";

  // Decay is a negative slope: correlation is weakening over time
  if (XiDot < -decayThreshold) return "DECAY";

  // Correlated contamination after structural checks
  if (Eta > contaminationThreshold) return "CONTAMINATED";

  // Geometry and spectral purity gates
  if (G < gammaMin) return "REJECT";
  if (Pi > -1) return "REJECT";

  return "ACCEPT";
}
