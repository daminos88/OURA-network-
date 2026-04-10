import { buildAttestationEnvelope, buildReplayProof } from "../core/attestation_engine_v1.js";

console.log("=== ATTESTATION ENGINE V1 PROBE START ===");

async function run() {
  const payload = {
    decision: "EXECUTE",
    profit: 0.0021,
    route: ["WETH", "USDC"]
  };

  const envelopeRes = buildAttestationEnvelope({ payload });
  const envelope = envelopeRes.envelope;

  const proofRes = buildReplayProof({ envelope });

  console.log("ENVELOPE:");
  console.log(envelope);

  console.log("REPLAY PROOF:");
  console.log(proofRes.proof);
}

run().catch(e => {
  console.error("FATAL:", e.message);
});
