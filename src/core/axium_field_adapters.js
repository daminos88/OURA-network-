export function normalizeQuote(raw = {}, source = "unknown") {
  return {
    source,
    price: Number(raw?.price ?? raw?.mid ?? 0),
    size: Number(raw?.size ?? raw?.qty ?? 0),
    side: String(raw?.side ?? "UNKNOWN"),
    ts: Number(raw?.ts ?? raw?.timestamp ?? Date.now())
  };
}

export function normalizeDepthLevel(raw = {}, source = "unknown") {
  return {
    source,
    price: Number(raw?.price ?? 0),
    depth: Number(raw?.depth ?? raw?.liquidity ?? raw?.size ?? 0),
    cost: Number(raw?.cost ?? raw?.slippage ?? 0),
    ts: Number(raw?.ts ?? raw?.timestamp ?? Date.now())
  };
}

export function normalizeVenueSnapshot(snapshot = {}, source = "unknown") {
  const quotes = Array.isArray(snapshot?.quotes) ? snapshot.quotes.map((q) => normalizeQuote(q, source)) : [];
  const depthLevels = Array.isArray(snapshot?.depthLevels)
    ? snapshot.depthLevels.map((d) => normalizeDepthLevel(d, source))
    : [];

  return {
    source,
    quotes,
    depthLevels,
    ofi: Number(snapshot?.ofi ?? 0),
    liquidity: Number(snapshot?.liquidity ?? 0),
    correlation: Number(snapshot?.correlation ?? 0),
    ts: Number(snapshot?.ts ?? snapshot?.timestamp ?? Date.now())
  };
}

export function normalizeMultiVenueInput(inputs = []) {
  return (Array.isArray(inputs) ? inputs : []).map((entry) =>
    normalizeVenueSnapshot(entry?.snapshot ?? entry, entry?.source ?? entry?.venue ?? "unknown")
  );
}
