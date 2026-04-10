import { JsonRpcProvider, Contract, formatUnits } from "ethers";

const PAIR_ABI = [
  "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
  "function token0() view returns (address)",
  "function token1() view returns (address)"
];

const ERC20_ABI = [
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

export async function fetchPairReserves({ rpcUrl, pairAddress }) {
  const provider = new JsonRpcProvider(rpcUrl, { name: "arbitrum", chainId: 42161 });
  const pair = new Contract(pairAddress, PAIR_ABI, provider);

  const [token0, token1, reserves, blockNumber] = await Promise.all([
    pair.token0(),
    pair.token1(),
    pair.getReserves(),
    provider.getBlockNumber()
  ]);

  const token0Contract = new Contract(token0, ERC20_ABI, provider);
  const token1Contract = new Contract(token1, ERC20_ABI, provider);

  const [dec0, dec1, sym0, sym1] = await Promise.all([
    token0Contract.decimals(),
    token1Contract.decimals(),
    token0Contract.symbol().catch(() => "TOKEN0"),
    token1Contract.symbol().catch(() => "TOKEN1")
  ]);

  const reserve0Raw = reserves[0];
  const reserve1Raw = reserves[1];

  return {
    ok: true,
    pairAddress,
    token0,
    token1,
    token0Symbol: sym0,
    token1Symbol: sym1,
    reserve0Raw: reserve0Raw.toString(),
    reserve1Raw: reserve1Raw.toString(),
    reserve0: Number(formatUnits(reserve0Raw, dec0)),
    reserve1: Number(formatUnits(reserve1Raw, dec1)),
    blockNumber,
    fetchedAt: new Date().toISOString()
  };
}

export async function fetchManyPairReserves({ rpcUrl, pairAddresses = [] }) {
  const results = await Promise.all(
    pairAddresses.map(async (pairAddress) => {
      try {
        return await fetchPairReserves({ rpcUrl, pairAddress });
      } catch (error) {
        return {
          ok: false,
          pairAddress,
          reason: error?.message || "reserve_fetch_failed"
        };
      }
    })
  );

  return {
    ok: true,
    results
  };
}
