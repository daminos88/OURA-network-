import { runMainnetMode } from "../core/mainnet_mode.js";

const RPC = "https://arb-mainnet.g.alchemy.com/v2/HHLjeTEA3XMBAwEIwHzmy";

console.log("=== MAINNET MODE PROBE START ===");

async function run() {
  const monitor = await runMainnetMode({ rpcUrl: RPC });
  console.log("MONITOR MODE:", monitor.mode);

  const armed = await runMainnetMode({ rpcUrl: RPC, armed: true });
  console.log("ARMED MODE:", armed.mode);

  const mainnet = await runMainnetMode({ rpcUrl: RPC, armed: true, mainnetEnabled: true });
  console.log("MAINNET MODE:", mainnet.mode);
}

run().catch(e => {
  console.error("FATAL:", e.message);
  process.exit(1);
});
