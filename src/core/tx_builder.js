import { buildRouteBundle } from "./route_builder.js";

export function buildApprovalStep({ token, spender, amount }) {
  return {
    type: "approval",
    target: token,
    method: "approve",
    args: [spender, amount]
  };
}

export function buildSwapStep({ venue, tokenIn, tokenOut, amountIn, minAmountOut }) {
  return {
    type: "swap",
    target: venue,
    method: "swapExactTokensForTokens",
    args: [amountIn, minAmountOut, [tokenIn, tokenOut]]
  };
}

export function buildTxPlan(signal) {
  const bundle = buildRouteBundle(signal);
  const plan = bundle.plan;

  const txs = [];

  for (const step of plan.steps) {
    txs.push(
      buildApprovalStep({
        token: step.tokenIn,
        spender: step.venue,
        amount: plan.size
      })
    );

    txs.push(
      buildSwapStep({
        venue: step.venue,
        tokenIn: step.tokenIn,
        tokenOut: step.tokenOut,
        amountIn: plan.size,
        minAmountOut: 0
      })
    );
  }

  return {
    ok: true,
    venue: plan.venue,
    stepCount: plan.stepCount,
    txCount: txs.length,
    txs,
    summary: {
      size: plan.size,
      expectedNetEth: plan.expectedNetEth,
      expectedEthBack: plan.expectedEthBack
    }
  };
}
