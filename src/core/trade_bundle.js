import { runMainnetMode } from "./mainnet_mode.js";

export function buildTradeBundle({ liveSignal, mode }) {
  const signal = liveSignal || {
    venue: "NONE",
    path: [],
    size: 0,
    netEth: 0,
    ethBack: 0
  };

  const allowed = mode === "MAINNET" || mode === "ARMED";

  const bundle = {
    mode,
    allowed,
    intent: allowed ? "PREPARE_BUNDLE" : "ABORT_BUNDLE",
    route: signal.path || [],
    venue: signal.venue || "NONE",
    size: signal.size || 0,
    expectedNetEth: signal.netEth || 0,
    expectedEthBack: signal.ethBack || 0,
    txs: allowed
      ? [
          {
            step: 1,
            action: "approve_or_flash_init",
            target: signal.venue || "NONE"
          },
          {
            step: 2,
            action: "execute_route",
            path: signal.path || []
          },
          {
            step: 3,
            action: "settle_and_repay"
          }
        ]
      : []
  };

  return bundle;
}

export async function prepareTradeBundle({ rpcUrl, armed = false, mainnetEnabled = false }) {
  const mainnet = await runMainnetMode({ rpcUrl, armed, mainnetEnabled });

  const liveSignal = mainnet?.live?.hybrid?.scan?.best || {
    venue: "NONE",
    path: [],
    size: 0,
    netEth: 0,
    ethBack: 0
  };

  const bundle = buildTradeBundle({
    liveSignal,
    mode: mainnet.mode
  });

  return {
    ok: true,
    mode: mainnet.mode,
    live: mainnet.live,
    bundle
  };
}
