export function normalizePath(path = []) {
  if (!Array.isArray(path)) return [];
  return path.map((p) => String(p));
}

export function buildRoutePlan(signal) {
  const venue = signal?.venue ?? "NONE";
  const path = normalizePath(signal?.path ?? []);
  const size = signal?.size ?? 0;
  const expectedNetEth = signal?.realNet ?? signal?.netEth ?? 0;
  const expectedEthBack = signal?.ethBack ?? 0;

  const steps = [];

  for (let i = 0; i < Math.max(0, path.length - 1); i++) {
    steps.push({
      index: i + 1,
      action: "swap",
      tokenIn: path[i],
      tokenOut: path[i + 1],
      venue
    });
  }

  return {
    ok: true,
    venue,
    path,
    size,
    expectedNetEth,
    expectedEthBack,
    stepCount: steps.length,
    steps
  };
}

export function buildRouteBundle(signal) {
  const plan = buildRoutePlan(signal);

  return {
    ok: true,
    plan,
    summary: {
      venue: plan.venue,
      hops: plan.stepCount,
      size: plan.size,
      expectedNetEth: plan.expectedNetEth
    }
  };
}
