import { ouraVerdictV2 as legacyOuraVerdictV2 } from "./oura_engine_v2.js";
import { computeAllGreeksV2 } from "./oura_primitives_v2.js";
import { ouraDecisionV2 } from "./oura_decisions_v2.js";

function buildLegacyGreek(candidate = {}) {
  const protectedProfit = Number(candidate?.protectedProfit ?? candidate?.trueExecutableProfit ?? candidate?.modeledRealNet ?? 0);
  const size = Number(candidate?.size ?? 0);
  const gasEth = Number(candidate?.gasModel?.gasEth ?? 0);

  const Xi = size > 0 ? Math.abs(protectedProfit) / size : 0;
  const Phi = protectedProfit > 0 ? 1 : 0;
  const Psi = Math.max(0, Math.trunc((1 - Math.min(1, Xi)) * 10000));
  const epsilon = size > 0 ? gasEth / size : 0;

  return {
    Xi,
    Phi,
    Psi,
    epsilon
  };
}

export function ouraVerdictV4(candidate = {}, config = {}) {
  const lensingGreek = computeAllGreeksV2(candidate, config);
  const legacyGreek = buildLegacyGreek(candidate);
  const legacy = legacyOuraVerdictV2(candidate);

  const decision = ouraDecisionV2(
    {
      K: lensingGreek.K,
      G: lensingGreek.G,
      Omega: lensingGreek.Omega,
      XiDot: lensingGreek.XiDot,
      Pi: lensingGreek.Pi,
      Eta: lensingGreek.Eta,
      Sigma: lensingGreek.Sigma
    },
    {
      kappaMax: config.kappaMax ?? 0.8,
      gammaMin: config.gammaMin ?? 0.01,
      decayThreshold: config.decayThreshold ?? 0.001,
      contaminationThreshold: config.contaminationThreshold ?? 0.5,
      sigmaMin: config.sigmaMin ?? 0.01,
      omegaMax: config.omegaMax ?? Number.POSITIVE_INFINITY
    }
  );

  return {
    ok: true,
    legacyGreek,
    legacy,
    lensingGreek,
    decision
  };
}
