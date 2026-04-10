import { Interface, parseUnits } from "ethers";

const ERC20_ABI = [
  "function approve(address spender, uint256 amount)"
];

const ROUTER_ABI = [
  "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] path, address to, uint deadline)"
];

const erc20Iface = new Interface(ERC20_ABI);
const routerIface = new Interface(ROUTER_ABI);

export function buildApproveCalldata({ token, spender, amount, decimals = 18 }) {
  const amountWei = parseUnits(String(amount), decimals);
  const data = erc20Iface.encodeFunctionData("approve", [spender, amountWei]);

  return {
    ok: true,
    txKind: "ERC20_APPROVE",
    target: token,
    value: "0x0",
    data,
    gasLimitHint: 65000
  };
}

export function buildSwapCalldata({ router, amountIn, amountOutMin, path, to, deadline, decimalsIn = 18, decimalsOut = 18 }) {
  const amountInWei = parseUnits(String(amountIn), decimalsIn);
  const amountOutMinWei = parseUnits(String(amountOutMin), decimalsOut);
  const data = routerIface.encodeFunctionData("swapExactTokensForTokens", [
    amountInWei,
    amountOutMinWei,
    path,
    to,
    deadline
  ]);

  return {
    ok: true,
    txKind: "ROUTER_SWAP_EXACT_TOKENS_FOR_TOKENS",
    target: router,
    value: "0x0",
    data,
    gasLimitHint: 350000
  };
}

export function buildCalldataPlan({ token, spender, amount, router, amountOutMin, path, to, deadline, decimals = 18 }) {
  const approve = buildApproveCalldata({
    token,
    spender,
    amount,
    decimals
  });

  const swap = buildSwapCalldata({
    router,
    amountIn: amount,
    amountOutMin,
    path,
    to,
    deadline,
    decimalsIn: decimals,
    decimalsOut: decimals
  });

  return {
    ok: true,
    steps: [approve, swap]
  };
}
