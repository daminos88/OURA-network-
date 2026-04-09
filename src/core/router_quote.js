import { JsonRpcProvider, Contract, parseEther, formatEther } from "ethers";

const ABI = [
  "function getAmountsOut(uint amountIn, address[] memory path) view returns (uint[] memory amounts)"
];

const TOKENS = {
  WETH: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
  USDC: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  USDT: "0xFd086bC7CD5C481DCC9C85ebe478A1C0b69FCbb9",
  DAI:  "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1"
};

const ROUTERS = [
  {
    name: "SUSHISWAP",
    address: "0x1b02da8cb0d097eb8d57a175b88c7d8b47997506"
  },
  {
    name: "UNISWAP_V2",
    address: "0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24"
  }
];

const TRIANGLES = [
  ["WETH", "USDC", "USDT", "WETH"],
  ["WETH", "USDT", "USDC", "WETH"],
  ["WETH", "USDC", "DAI", "WETH"],
  ["WETH", "DAI", "USDC", "WETH"]
];

async function getOut(contract, amountInWei, pathAddrs) {
  const amounts = await contract.getAmountsOut(amountInWei, pathAddrs);
  if (!amounts || !amounts.length) return null;
  return amounts[amounts.length - 1];
}

export async function getMultiRouterSurface({ rpcUrl, amountInEth }) {
  const provider = new JsonRpcProvider(rpcUrl, {
    name: "arbitrum",
    chainId: 42161
  });

  const amountInWei = parseEther(String(amountInEth));
  const quotes = [];

  for (const r1 of ROUTERS) {
    const c1 = new Contract(r1.address, ABI, provider);

    for (const tri of TRIANGLES) {
      const [a, b, c, d] = tri;
      const p1 = [TOKENS[a], TOKENS[b]];
      const p2 = [TOKENS[b], TOKENS[c]];
      const p3 = [TOKENS[c], TOKENS[d]];

      try {
        const out1 = await getOut(c1, amountInWei, p1);
        if (!out1) continue;

        for (const r2 of ROUTERS) {
          const c2 = new Contract(r2.address, ABI, provider);

          const out2 = await getOut(c2, out1, p2);
          if (!out2) continue;

          for (const r3 of ROUTERS) {
            const c3 = new Contract(r3.address, ABI, provider);

            const out3 = await getOut(c3, out2, p3);
            if (!out3) continue;

            const ethBack = Number(formatEther(out3));
            const netEth = ethBack - Number(amountInEth);

            quotes.push({
              venue: `${r1.name}->${r2.name}->${r3.name}`,
              path: tri,
              ethStart: Number(amountInEth),
              ethBack,
              netEth
            });
          }
        }
      } catch {
        continue;
      }
    }
  }

  if (!quotes.length) {
    return {
      ok: true,
      viable: false,
      reason: "no_quotes",
      quotes: [],
      best: null
    };
  }

  const best = [...quotes].sort((a, b) => b.netEth - a.netEth)[0];

  return {
    ok: true,
    viable: best.netEth > 0,
    quotes,
    best
  };
}
