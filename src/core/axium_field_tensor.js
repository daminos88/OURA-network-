export function buildFieldTensor(snapshots = []) {
  const rows = Array.isArray(snapshots) ? snapshots : [];

  const tensor = rows.map((snapshot) => ({
    source: String(snapshot?.source ?? "unknown"),
    ts: Number(snapshot?.ts ?? Date.now()),
    ofi: Number(snapshot?.ofi ?? 0),
    liquidity: Number(snapshot?.liquidity ?? 0),
    correlation: Number(snapshot?.correlation ?? 0),
    quotes: Array.isArray(snapshot?.quotes) ? snapshot.quotes : [],
    depthLevels: Array.isArray(snapshot?.depthLevels) ? snapshot.depthLevels : []
  }));

  return {
    ok: true,
    tensor,
    shape: {
      venues: tensor.length,
      quote_rows: tensor.reduce((acc, row) => acc + row.quotes.length, 0),
      depth_rows: tensor.reduce((acc, row) => acc + row.depthLevels.length, 0)
    }
  };
}

export function collapseFieldTensor(fieldTensor = { tensor: [] }) {
  const tensor = Array.isArray(fieldTensor?.tensor) ? fieldTensor.tensor : [];

  const quotes = [];
  const depthLevels = [];
  let ofi = 0;
  let liquidity = 0;
  let correlation = 0;

  for (const row of tensor) {
    quotes.push(...(Array.isArray(row?.quotes) ? row.quotes : []));
    depthLevels.push(...(Array.isArray(row?.depthLevels) ? row.depthLevels : []));
    ofi += Number(row?.ofi ?? 0);
    liquidity += Number(row?.liquidity ?? 0);
    correlation += Number(row?.correlation ?? 0);
  }

  return {
    ok: true,
    quotes,
    depthLevels,
    ofi,
    liquidity,
    correlation,
    venueCount: tensor.length
  };
}
