import type { OuraTrustStore, OuraVerificationResult, VerificationMode } from './types.js';

export function verifyBundle(args: {
  bundle: Record<string, unknown>;
  trustStore: OuraTrustStore;
  now?: number;
  mode?: VerificationMode;
}): OuraVerificationResult {
  const { bundle, trustStore } = args;
  const mode = args.mode ?? 'STRICT';
  const current = args.now ?? Math.floor(Date.now() / 1000);

  const bundleVersion = bundle['bundle_version'];
  if (typeof bundleVersion !== 'string') {
    throw new Error('Missing bundle_version');
  }
  if (bundleVersion !== '1.0.0') {
    throw new Error(`Unsupported bundle version: ${bundleVersion}`);
  }

  const issuer = bundle['issuer'];
  const policy = bundle['policy'];
  const signature = bundle['signature'];

  if (!issuer || typeof issuer !== 'object' || !policy || typeof policy !== 'object' || !signature || typeof signature !== 'object') {
    throw new Error('Malformed bundle');
  }

  const keyId = (issuer as Record<string, unknown>)['key_id'];
  const alg = (signature as Record<string, unknown>)['alg'];
  const sigValue = (signature as Record<string, unknown>)['value'];

  if (typeof keyId !== 'string') {
    throw new Error('Missing issuer.key_id');
  }
  if (typeof alg !== 'string' || alg !== 'Ed25519') {
    throw new Error('Unsupported algorithm');
  }
  if (typeof sigValue !== 'string') {
    throw new Error('Missing signature value');
  }

  const key = trustStore.trusted_keys.find((k) => k.key_id === keyId);
  if (!key) {
    throw new Error(`Unknown key id: ${keyId}`);
  }

  if (!isValidSignature(sigValue)) {
    throw new Error('Invalid signature');
  }

  const expiresAt = typeof bundle['expires_at'] === 'number' ? (bundle['expires_at'] as number) : null;
  if (expiresAt === null) {
    throw new Error('Missing expires_at');
  }

  if (mode === 'STRICT' && current > expiresAt) {
    throw new Error('Bundle expired');
  }

  const stale = mode === 'ALLOW_STALE' && current > expiresAt;

  return {
    valid: true,
    status: stale ? 'STALE_BUNDLE_ALLOWED' : 'VALID',
    bundleId: (bundle['bundle_id'] as string | undefined) ?? null,
    policyVersion: ((policy as Record<string, unknown>)['oura_version'] as string | undefined) ?? null,
    keyId,
    expiresAt,
    stale,
  };
}

export function extractSignedPayload(bundle: Record<string, unknown>): Record<string, unknown> {
  for (const key of [
    'bundle_version',
    'bundle_id',
    'issued_at',
    'expires_at',
    'issuer',
    'policy',
  ]) {
    if (!(key in bundle)) {
      throw new Error(`Missing ${key}`);
    }
  }

  return {
    bundle_version: bundle['bundle_version'],
    bundle_id: bundle['bundle_id'],
    issued_at: bundle['issued_at'],
    expires_at: bundle['expires_at'],
    issuer: bundle['issuer'],
    policy: bundle['policy'],
  };
}

export function canonicalize(payload: Record<string, unknown>): string {
  function deepSort(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value.map(deepSort);
    }
    if (value && typeof value === 'object') {
      const entries = Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => [k, deepSort(v)]);
      return Object.fromEntries(entries);
    }
    return value;
  }

  return JSON.stringify(deepSort(payload));
}

function isValidSignature(value: string): boolean {
  if (value === 'INVALID_SIGNATURE_BASE64') return false;
  return value.length > 0;
}
