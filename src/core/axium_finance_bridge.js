import { normalizeMultiVenueInput } from "./axium_field_adapters.js";
import { buildFieldTensor, collapseFieldTensor } from "./axium_field_tensor.js";

export function bridgeFinanceCandidateToField(candidate = {}, sources = []) {
  const normalized = normalizeMultiVenueInput(sources);
  const tensor = buildFieldTensor(normalized);
  const collapsed = collapseFieldTensor(tensor);

  return {
    ok: true,
    candidateId: candidate?.id ?? null,
    candidate,
    field: {
      quotes: collapsed.quotes,
      depthLevels: collapsed.depthLevels,
      ofi: collapsed.ofi,
      liquidity: collapsed.liquidity,
      correlation: collapsed.correlation,
      venueCount: collapsed.venueCount
    },
    tensorShape: tensor.shape
  };
}

export function bridgeBatchFinanceCandidates(candidates = [], sourceMap = {}) {
  return (Array.isArray(candidates) ? candidates : []).map((candidate) => {
    const sources = Array.isArray(sourceMap?.[candidate?.id]) ? sourceMap[candidate.id] : [];
    return bridgeFinanceCandidateToField(candidate, sources);
  });
}
