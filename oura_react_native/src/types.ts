export type VerificationMode = 'STRICT' | 'ALLOW_STALE' | 'SIGNATURE_ONLY';

export type OuraScores = {
  R: number;
  B: number;
};

export type OuraMeta = {
  ouraVersion: string;
  selectedPriority: number | null;
};

export type OuraEvaluationResult = {
  matched: boolean;
  matchedRules: string[];
  scores: OuraScores | null;
  meta: OuraMeta;
};

export type OuraVerificationResult = {
  valid: boolean;
  status: string;
  bundleId: string | null;
  policyVersion: string | null;
  keyId: string | null;
  expiresAt: number | null;
  stale: boolean;
};

export type OuraTrustKey = {
  key_id: string;
  alg: string;
  public_key: string;
};

export type OuraTrustStore = {
  trusted_keys: OuraTrustKey[];
};
