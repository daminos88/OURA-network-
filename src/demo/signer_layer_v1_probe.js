import { buildSignerRequest, buildSignedEnvelope } from "../core/signer_layer_v1.js";

console.log("=== SIGNER LAYER V1 PROBE START ===");

async function run() {
  const relayPlan = {
    relay: "PRIVATE_RELAY",
    endpointType: "private",
    dispatchPlan: [
      { txKind: "ERC20_APPROVE", target: "0xToken", value: "0x0", data: "0xabc", gasLimitHint: 65000 },
      { txKind: "SWAP", target: "0xRouter", value: "0x0", data: "0xdef", gasLimitHint: 300000 }
    ]
  };

  const signerReq = buildSignerRequest({ relayPlan, chainId: 42161, account: "0xYourAddress" });

  const mockResponse = {
    accepted: true,
    signatureCount: 2,
    signerRef: "external-hsm-1"
  };

  const envelope = buildSignedEnvelope({ signerRequest: signerReq, signerResponse: mockResponse });

  console.log("SIGNER REQUEST:");
  console.log(signerReq);

  console.log("SIGNED ENVELOPE:");
  console.log(envelope);
}

run().catch(e => {
  console.error("FATAL:", e.message);
});
