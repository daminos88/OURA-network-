import { JsonRpcProvider, Contract, parseEther, formatEther } from "ethers";

const QUOTER_ABI = [
  "function getAmountsOut(uint amountIn, address[] memory path) view returns (uint[] memory amounts)"
];

const PAIR_ABI = [
  "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)"
];

const TOKENS = {
  WETH: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
  USDC: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  USDT: "0xFd086bC7CD5C481DCC9C85ebe478A1C0b69FCbb9",
  DAI: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1"
};

const ROUTERS = [
  { name: "SUSHISWAP", address: "0x1b02da8cb0d097eb8d57a175b88c7d8b47997506" },
  { name: "UNISWAP_V2", address: "0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24" }
];

const TRIANGLES = [
  ["WETH", "USDC", "USDT", "WETH"],
  ["WETH", "USDT", "USDC", "WETH"],
  ["WETH", "USDC", "DAI", "WETH"],
  ["WETH", "DAI", "USDC", "WETH"]
];

function timeoutPromise(ms, tag = "timeout") {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(tag)), ms);
  });
}

async function safeGetAmountsOut(contract, amountInWei, pathAddrs, timeoutMs = 4000) {
  try {
    const amounts = await Promise.race([
      contract.getAmountsOut(amountInWei, pathAddrs),
      timeoutPromise(timeoutMs, "quote_timeout")
    ]);
    if (!amounts || !amounts.length) return null;
    return amounts[amounts.length - 1];
  } catch {
    return null;
  }
}

export async function getMultiRouterSurfaceV2({ rpcUrl, amountInEth }) {
  const provider = new JsonRpcProvider(rpcUrl, { name: "arbitrum", chainId: 42161 });
  const amountInWei = parseEther(String(amountInEth));
  const quotes = [];

  const legs = [];
  for (const tri of TRIANGLES) {
    const [a, b, c, d] = tri;
    const p1 = [TOKENS[a], TOKENS[b]];
    const p2 = [TOKENS[b], TOKENS[c]];
    const p3 = [TOKENS[c], TOKENS[d]];

    for (const r1 of ROUTERS) {
      for (const r2 of ROUTERS) {
        for (const r3 of ROUTERS) {
          legs.push({ tri, r1, r2, r3, p1, p2, p3 });
        }
      }
    }
  }

  const tasks = legs.map(async ({ tri, r1, r2, r3, p1, p2, p3 }) => {
    const c1 = new Contract(r1.address, QUOTER_ABI, provider);
    const c2 = new Contract(r2.address, QUOTER_ABI, provider);
    const c3 = new Contract(r3.address, QUOTER_ABI, provider);

    const out1 = await safeGetAmountsOut(c1, amountInWei, p1);
    if (!out1) return null;
    const out2 = await safeGetAmountsOut(c2, out1, p2);
    if (!out2) return null;
    const out3 = await safeGetAmountsOut(c3, out2, p3);
    if (!out3) return null;

    const ethBack = Number(formatEther(out3));
    const netEth = ethBack - Number(amountInEth);

    return {
      venue: `${r1.name}->${r2.name}->${r3.name}`,
      path: tri,
      ethStart: Number(amountInEth),
      ethBack,
      netEth,
      timeoutSafe: true
    };
  });

  const results = await Promise.all(tasks);
  for (const q of results) {
    if (q) quotes.push(q);
  }

  if (!quotes.length) {
    return { ok: true, viable: false, reason: "no_quotes_v2", quotes: [], best: null };
  }

  const best = [...quotes].sort((a, b) => b.netEth - a.netEth)[0];
  return { ok: true, viable: best.netEth > 0, quotes, best };
}
