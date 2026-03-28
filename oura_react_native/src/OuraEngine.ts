import type {
  OuraEvaluationResult,
  OuraTrustStore,
  OuraVerificationResult,
  VerificationMode,
} from './types.js';

export class OuraEngine {
  private readonly trustStore: OuraTrustStore;
  private loadedBundle: Record<string, unknown> | null = null;
  private verified = false;

  constructor(args: { trustStore: OuraTrustStore }) {
    this.trustStore = args.trustStore;
  }

  loadBundle(bundleJson: string): void {
    const parsed = JSON.parse(bundleJson) as Record<string, unknown>;
    this.loadedBundle = parsed;
    this.verified = false;
  }

  verifyLoadedBundle(args: { mode?: VerificationMode; now?: number } = {}): OuraVerificationResult {
    if (!this.loadedBundle) {
      throw new Error('Bundle not loaded');
    }

    const mode = args.mode ?? 'STRICT';
    const bundle = this.loadedBundle;
    const expiresAt = typeof bundle['expires_at'] === 'number' ? (bundle['expires_at'] as number) : null;
    const current = args.now ?? Math.floor(Date.now() / 1000);

    if (mode === 'STRICT' && expiresAt !== null && current > expiresAt) {
      throw new Error('Bundle expired');
    }

    this.verified = true;

    const stale = mode === 'ALLOW_STALE' && expiresAt !== null && current > expiresAt;
    const policy = (bundle['policy'] ?? null) as Record<string, unknown> | null;
    const issuer = (bundle['issuer'] ?? null) as Record<string, unknown> | null;

    return {
      valid: true,
      status: stale ? 'STALE_BUNDLE_ALLOWED' : 'VALID',
      bundleId: (bundle['bundle_id'] as string | undefined) ?? null,
      policyVersion: (policy?.['oura_version'] as string | undefined) ?? null,
      keyId: (issuer?.['key_id'] as string | undefined) ?? null,
      expiresAt,
      stale,
    };
  }

  evaluate(context: Record<string, unknown>): OuraEvaluationResult {
    if (!this.loadedBundle || !this.verified) {
      throw new Error('Bundle not verified');
    }

    const policy = this.loadedBundle['policy'] as Record<string, unknown> | undefined;
    const rules = (policy?.['rules'] as Array<Record<string, unknown>> | undefined) ?? [];

    const matches = rules.filter((rule) => {
      const when = rule['when'] as Record<string, unknown> | undefined;
      if (!when) return false;
      if (when['type'] === 'comparison') {
        const field = when['field'] as string;
        const op = when['op'] as string;
        const value = when['value'];
        const actual = Object.prototype.hasOwnProperty.call(context, field) ? context[field] : null;
        if (op === '==') return actual === value;
        if (op === '!=') return actual !== value;
        if (op === 'IN' && Array.isArray(value)) return value.includes(actual as never);
        if (actual == null) return false;
        if (typeof actual !== 'number' || typeof value !== 'number') return false;
        switch (op) {
          case '>': return actual > value;
          case '<': return actual < value;
          case '>=': return actual >= value;
          case '<=': return actual <= value;
          default: return false;
        }
      }
      return false;
    });

    if (matches.length === 0) {
      return {
        matched: false,
        matchedRules: [],
        scores: null,
        meta: {
          ouraVersion: '1.0.0',
          selectedPriority: null,
        },
      };
    }

    const ordered = [...matches].sort((a, b) => ((b['priority'] as number) ?? 0) - ((a['priority'] as number) ?? 0));
    const highest = (ordered[0]['priority'] as number) ?? 0;
    const selected = ordered.filter((r) => ((r['priority'] as number) ?? 0) === highest);

    return {
      matched: true,
      matchedRules: selected.map((r) => r['rule_id'] as string),
      scores: {
        R: Math.max(...selected.map((r) => ((r['set'] as Record<string, unknown>)['R'] as number) ?? 0)),
        B: Math.max(...selected.map((r) => ((r['set'] as Record<string, unknown>)['B'] as number) ?? 0)),
      },
      meta: {
        ouraVersion: '1.0.0',
        selectedPriority: highest,
      },
    };
  }

  bundleId(): string | null {
    return (this.loadedBundle?.['bundle_id'] as string | undefined) ?? null;
  }

  expiresAt(): number | null {
    return (this.loadedBundle?.['expires_at'] as number | undefined) ?? null;
  }

  policyVersion(): string | null {
    const policy = this.loadedBundle?.['policy'] as Record<string, unknown> | undefined;
    return (policy?.['oura_version'] as string | undefined) ?? null;
  }
}
