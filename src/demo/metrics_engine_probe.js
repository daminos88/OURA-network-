import { runLiveLoop } from "../core/live_loop.js";
import { summarizeLiveLoop, rollingAverages } from "../core/metrics_engine.js";

const RPC = "https://arb-mainnet.g.alchemy.com/v2/HHLjeTEA3XMBAwEIwHzmy";

console.log("=== METRICS ENGINE PROBE START ===");

async function run() {
  const history = [];

  for (let i = 0; i < 3; i++) {
    const loop = await runLiveLoop({ rpcUrl: RPC, cycles: 3 });
    const summary = summarizeLiveLoop(loop.results);
    history.push(summary);

    console.log(`ITERATION ${i + 1} SUMMARY:`);
    console.log(summary);
  }

  const rolling = rollingAverages(history);

  console.log("ROLLING AVERAGES:");
  console.log(rolling);
}

run().catch(e => {
  console.error("FATAL:", e.message);
});
