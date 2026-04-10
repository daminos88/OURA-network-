import { createHash } from "crypto";

function canonicalStringify(value) {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(canonicalStringify).join(",")}]`;
  }

  const keys = Object.keys(value).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalStringify(value[k])}`).join(",")}}`;
}

export function hashAttestationPayload(payload = {}) {
  const canonical = canonicalStringify(payload);
  const digest = createHash("sha256").update(canonical).digest("hex");

  return {
    ok: true,
    canonical,
    digest
  };
}

export function buildAttestationEnvelope({ kind = "EXECUTION_PLAN", payload = {}, signer = "AXIUM_ATTESTOR_V1" } = {}) {
  const hashed = hashAttestationPayload(payload);

  return {
    ok: true,
    envelope: {
      version: "1.0",
      kind,
      signer,
      digest: hashed.digest,
      payload,
      issuedAt: new Date().toISOString()
    }
  };
}

export function buildReplayProof({ envelope, previousDigest = null } = {}) {
  const base = {
    previousDigest,
    envelopeDigest: envelope?.digest ?? null,
    issuedAt: envelope?.issuedAt ?? null
  };

  const hashed = hashAttestationPayload(base);

  return {
    ok: true,
    proof: {
      previousDigest,
      envelopeDigest: envelope?.digest ?? null,
      chainDigest: hashed.digest,
      issuedAt: envelope?.issuedAt ?? null
    }
  };
}
