export function assessRisk(signal, config = {}) {
  const {
    maxSize = 0.01,
    maxHops = 4,
    minRealNet = 0,
    minScore = 0,
    maxExposure = 0.02,
    currentExposure = 0
  } = config;

  const size = signal?.size ?? 0;
  const hops = Array.isArray(signal?.path) ? signal.path.length : 0;
  const realNet = signal?.realNet ?? signal?.netEth ?? 0;
  const score = signal?.score ?? 0;

  const flags = [];
  let cappedSize = size;
  let allow = true;

  if (size > maxSize) {
    cappedSize = maxSize;
    flags.push("size_capped");
  }

  if (hops > maxHops) {
    allow = false;
    flags.push("too_many_hops");
  }

  if (realNet <= minRealNet) {
    allow = false;
    flags.push("realnet_below_threshold");
  }

  if (score < minScore) {
    allow = false;
    flags.push("score_below_threshold");
  }

  if (currentExposure + cappedSize > maxExposure) {
    allow = false;
    flags.push("exposure_limit_exceeded");
  }

  return {
    allow,
    cappedSize,
    flags,
    exposureAfter: currentExposure + cappedSize
  };
}

export function applyRiskToRankedSignals(rankedSignals = [], config = {}) {
  let exposure = config.currentExposure ?? 0;

  return rankedSignals.map((signal) => {
    const res = assessRisk(signal, { ...config, currentExposure: exposure });
    if (res.allow) {
      exposure = res.exposureAfter;
    }
    return {
      ...signal,
      risk: res
    };
  });
}
