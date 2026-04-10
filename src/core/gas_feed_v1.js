import { JsonRpcProvider } from "ethers";

export async function fetchGasFeedV1({ rpcUrl }) {
  const provider = new JsonRpcProvider(rpcUrl, { name: "arbitrum", chainId: 42161 });

  try {
    const feeData = await provider.getFeeData();

    const gasPriceWei = feeData.gasPrice ?? 0n;
    const maxFeePerGasWei = feeData.maxFeePerGas ?? 0n;
    const maxPriorityFeePerGasWei = feeData.maxPriorityFeePerGas ?? 0n;

    const toGwei = (wei) => Number(wei) / 1e9;

    return {
      ok: true,
      gasPriceGwei: toGwei(gasPriceWei),
      maxFeePerGasGwei: toGwei(maxFeePerGasWei),
      maxPriorityFeePerGasGwei: toGwei(maxPriorityFeePerGasWei),
      source: "rpc_feeData"
    };
  } catch (error) {
    return {
      ok: false,
      gasPriceGwei: 0.1,
      maxFeePerGasGwei: 0.1,
      maxPriorityFeePerGasGwei: 0.01,
      source: "fallback_default",
      reason: error?.message || "gas_feed_failed"
    };
  }
}
