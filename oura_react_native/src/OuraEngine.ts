import type {
  OuraEvaluationResult,
  OuraTrustStore,
  OuraVerificationResult,
  VerificationMode,
} from './types.js';
import { verifyBundle } from './bundle.js';

const SUPPORTED_VERSION = '1.0.0';

type JsonMap = Record<string, unknown>;

export class OuraEngine {
  private readonly trustStore: OuraTrustStore;
  private loadedBundle: JsonMap | null = null;
  private verified = false;

  constructor(args: { trustStore: OuraTrustStore }) {
    this.trustStore = args.trustStore;
  }

  loadBundle(bundleJson: string): void {
    const parsed = JSON.parse(bundleJson) as JsonMap;
    this.loadedBundle = parsed;
    this.verified = false;
  }

  verifyLoadedBundle(args: { mode?: VerificationMode; now?: number } = {}): OuraVerificationResult {
    if (!this.loadedBundle) {
      throw new Error('Bundle not loaded');
    }

    const result = verifyBundle({
      bundle: this.loadedBundle,
      trustStore: this.trustStore,
      now: args.now,
      mode: args.mode,
    });

    this.verified = true;
    return result;
  }

  evaluate(context: Record<string, unknown>): OuraEvaluationResult {
    if (!this.loadedBundle || !this.verified) {
      throw new Error('Bundle not verified');
    }

    const policy = this.loadedBundle['policy'] as JsonMap | undefined;
    const rules = (policy?.['rules'] as Array<JsonMap> | undefined) ?? [];

    const indexed = rules.map((rule, index) => ({ rule, index }))
      .sort((a, b) => {
        const pA = typeof a.rule['priority'] === 'number' ? (a.rule['priority'] as number) : 0;
        const pB = typeof b.rule['priority'] === 'number' ? (b.rule['priority'] as number) : 0;
        if (pA !== pB) return pB - pA;
        return a.index - b.index;
      });

    const matches: JsonMap[] = [];

    for (const item of indexed) {
      const expr = item.rule['when'];
      if (this.evalExpr(expr, context)) {
        matches.push(item.rule);
      }
    }

    if (matches.length === 0) {
      return {
        matched: false,
        matchedRules: [],
        scores: null,
        meta: {
          ouraVersion: SUPPORTED_VERSION,
          selectedPriority: null,
        },
      };
    }

    const highest = typeof matches[0]['priority'] === 'number' ? (matches[0]['priority'] as number) : 0;
    const selected = matches.filter((rule) => ((rule['priority'] as number) ?? 0) === highest);

    return {
      matched: true,
      matchedRules: selected.map((r) => String(r['rule_id'])),
      scores: {
        R: Math.max(...selected.map((r) => {
          const set = r['set'] as JsonMap | undefined;
          return typeof set?.['R'] === 'number' ? (set['R'] as number) : 0;
        })),
        B: Math.max(...selected.map((r) => {
          const set = r['set'] as JsonMap | undefined;
          return typeof set?.['B'] === 'number' ? (set['B'] as number) : 0;
        })),
      },
      meta: {
        ouraVersion: SUPPORTED_VERSION,
        selectedPriority: highest,
      },
    };
  }

  private evalExpr(expr: unknown, context: Record<string, unknown>): boolean {
    if (!expr || typeof expr !== 'object') {
      throw new Error('Invalid expression');
    }

    const map = expr as JsonMap;
    const type = map['type'];

    if (type === 'comparison') {
      const field = typeof map['field'] === 'string' ? (map['field'] as string) : '';
      const op = typeof map['op'] === 'string' ? (map['op'] as string) : '';
      const expected = map['value'];
      const actual = Object.prototype.hasOwnProperty.call(context, field) ? context[field] : null;
      return this.compare(actual, op, expected);
    }

    if (type === 'logical') {
      const op = typeof map['op'] === 'string' ? (map['op'] as string) : '';
      const children = Array.isArray(map['children']) ? (map['children'] as unknown[]) : [];

      if (op === 'AND') {
        return children.every((child) => this.evalExpr(child, context));
      }
      if (op === 'OR') {
        return children.some((child) => this.evalExpr(child, context));
      }

      throw new Error('Unknown logical op');
    }

    throw new Error('Unknown expression type');
  }

  private compare(actual: unknown, op: string, expected: unknown): boolean {
    if (op === '==') {
      return this.isEqual(actual, expected);
    }
    if (op === '!=') {
      return !this.isEqual(actual, expected);
    }
    if (actual == null) {
      return false;
    }
    if (op === 'IN') {
      if (!Array.isArray(expected)) return false;
      return expected.some((value) => this.isEqual(actual, value));
    }

    if (typeof actual !== 'number' || typeof expected !== 'number') {
      return false;
    }

    switch (op) {
      case '>':
        return actual > expected;
      case '<':
        return actual < expected;
      case '>=':
        return actual >= expected;
      case '<=':
        return actual <= expected;
      default:
        return false;
    }
  }

  private isEqual(a: unknown, b: unknown): boolean {
    if (a === null && b === null) return true;
    if (typeof a === 'string' && typeof b === 'string') return a === b;
    if (typeof a === 'number' && typeof b === 'number') return a === b;
    if (typeof a === 'boolean' && typeof b === 'boolean') return a === b;
    return false;
  }

  bundleId(): string | null {
    return (this.loadedBundle?.['bundle_id'] as string | undefined) ?? null;
  }

  expiresAt(): number | null {
    return (this.loadedBundle?.['expires_at'] as number | undefined) ?? null;
  }

  policyVersion(): string | null {
    const policy = this.loadedBundle?.['policy'] as JsonMap | undefined;
    return (policy?.['oura_version'] as string | undefined) ?? null;
  }
}
