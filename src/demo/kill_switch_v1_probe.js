import { applyKillSwitch } from "../core/kill_switch_v1.js";

console.log("=== KILL SWITCH V1 PROBE START ===");

async function run() {
  const candidates = [
    { protectedProfit: 0.002 },
    { protectedProfit: -0.001 }
  ];

  const context = {
    nonceConsistent: true,
    retryTerminal: false,
    governanceFreeze: false,
    operatorFreeze: false,
    consecutiveBlocked: 2,
    maxConsecutiveBlocked: 3,
    relayFailures: 1,
    maxRelayFailures: 3
  };

  const res = applyKillSwitch(candidates, context);

  console.log("KILL SWITCH RESULT:");
  console.log(res);
}

run().catch(e => {
  console.error("FATAL:", e.message);
});
