import { JsonRpcProvider, Contract, parseEther, formatUnits } from "ethers";

const ABI = [
  "function getAmountsOut(uint amountIn, address[] memory path) view returns (uint[] memory amounts)"
];

const TOKENS = {
  WETH: { address: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1", decimals: 18 },
  USDC: { address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", decimals: 6 },
  USDT: { address: "0xFd086bC7CD5C481DCC9C85ebe478A1C0b69FCbb9", decimals: 6 },
  DAI:  { address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", decimals: 18 }
};

const ROUTERS = [
  { name: "SUSHISWAP", address: "0x1b02da8cb0d097eb8d57a175b88c7d8b47997506" },
  { name: "UNISWAP_V2", address: "0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24" }
];

async function quotePair(contract, amountInWei, tokenIn, tokenOut) {
  const amounts = await contract.getAmountsOut(amountInWei, [tokenIn.address, tokenOut.address]);
  if (!amounts || amounts.length < 2) return null;
  return Number(formatUnits(amounts[1], tokenOut.decimals));
}

export async function comparePairAcrossRouters({ rpcUrl, pair = ["WETH", "USDC"], amountInEth = 0.001 }) {
  const provider = new JsonRpcProvider(rpcUrl, { name: "arbitrum", chainId: 42161 });

  const [base, quote] = pair;
  const tokenIn = TOKENS[base];
  const tokenOut = TOKENS[quote];
  if (!tokenIn || !tokenOut) {
    return { ok: false, reason: "unknown_pair", quotes: [], edges: [] };
  }

  const amountInWei = parseEther(String(amountInEth));
  const quotes = [];

  for (const router of ROUTERS) {
    try {
      const contract = new Contract(router.address, ABI, provider);
      const out = await quotePair(contract, amountInWei, tokenIn, tokenOut);
      if (typeof out !== "number") continue;
      quotes.push({
        venue: router.name,
        pair: `${base}/${quote}`,
        amountInEth,
        amountOut: out,
        price: out / amountInEth
      });
    } catch {
      continue;
    }
  }

  const edges = [];
  for (let i = 0; i < quotes.length; i++) {
    for (let j = i + 1; j < quotes.length; j++) {
      const a = quotes[i];
      const b = quotes[j];
      const spread = b.price - a.price;
      edges.push({
        pair: a.pair,
        a: a.venue,
        b: b.venue,
        spread,
        direction: spread > 0 ? `${a.venue}->${b.venue}` : `${b.venue}->${a.venue}`
      });
    }
  }

  edges.sort((x, y) => Math.abs(y.spread) - Math.abs(x.spread));

  return {
    ok: true,
    quotes,
    edges,
    bestEdge: edges[0] || null
  };
}
