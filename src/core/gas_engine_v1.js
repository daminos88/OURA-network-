export function estimateGasCost({ gasUnits = 250000, gasPriceGwei = 0.1, ethPriceUsd = null }) {
  const gasEth = Number(gasUnits) * Number(gasPriceGwei) * 1e-9;
  return {
    ok: true,
    gasUnits: Number(gasUnits),
    gasPriceGwei: Number(gasPriceGwei),
    gasEth,
    gasUsd: ethPriceUsd ? gasEth * Number(ethPriceUsd) : null
  };
}

export function applyGasToCandidate(candidate, config = {}) {
  const gas = estimateGasCost(config);
  const modeledRealNet = Number(candidate?.modeledRealNet ?? candidate?.realNet ?? candidate?.netEth ?? 0);
  const trueExecutableProfit = modeledRealNet - gas.gasEth;

  return {
    ...candidate,
    gasModel: gas,
    trueExecutableProfit,
    executableAfterGas: trueExecutableProfit > 0
  };
}

export function rerankByTrueExecutableProfit(candidates = [], config = {}) {
  return candidates
    .map((c) => applyGasToCandidate(c, config))
    .sort((a, b) => (b.trueExecutableProfit ?? -Infinity) - (a.trueExecutableProfit ?? -Infinity));
}
