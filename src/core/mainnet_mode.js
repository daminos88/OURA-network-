import { runLiveLayer } from "./live_layer.js";

export function resolveMainnetMode({ state, armed = false, mainnetEnabled = false }) {
  if (mainnetEnabled && state === "READY_FOR_SEAL") return "MAINNET";
  if (armed && state === "READY_FOR_SEAL") return "ARMED";
  if (state === "HOLD") return "PAPER";
  return "MONITOR";
}

export async function runMainnetMode({ rpcUrl, armed = false, mainnetEnabled = false }) {
  const live = await runLiveLayer({ rpcUrl });
  const mode = resolveMainnetMode({
    state: live.state,
    armed,
    mainnetEnabled
  });

  return {
    ok: true,
    mode,
    live
  };
}
