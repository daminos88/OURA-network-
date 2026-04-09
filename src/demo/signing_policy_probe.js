import { probeSigningPolicy } from "../core/signing_policy.js";

console.log("=== SIGNING POLICY PROBE START ===");

const results = probeSigningPolicy();

for (const r of results) {
  console.log("STATE:", r.state, "| canSign:", r.canSign, "| reason:", r.reason);
}
