import { prepareTradeBundle } from "../core/trade_bundle.js";

const RPC = "https://arb-mainnet.g.alchemy.com/v2/HHLjeTEA3XMBAwEIwHzmy";

console.log("=== TRADE BUNDLE PROBE START ===");

async function run() {
  const res = await prepareTradeBundle({ rpcUrl: RPC });
  console.log("MONITOR BUNDLE:", res.bundle.intent);

  const armed = await prepareTradeBundle({ rpcUrl: RPC, armed: true });
  console.log("ARMED BUNDLE:", armed.bundle.intent);

  const mainnet = await prepareTradeBundle({ rpcUrl: RPC, armed: true, mainnetEnabled: true });
  console.log("MAINNET BUNDLE:", mainnet.bundle.intent);

  console.log("DETAIL:", mainnet.bundle);
}

run().catch(e => {
  console.error("FATAL:", e.message);
  process.exit(1);
});
