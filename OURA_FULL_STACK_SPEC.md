# OURA Full Stack Architecture

## What OURA is
OURA is a verified policy runtime and distribution system designed to let applications load signed policy bundles, verify trust, evaluate decisions locally, and return deterministic risk outputs.

The full stack consists of:
- policy authoring and signing
- trust-store distribution
- client runtimes (Flutter, RN, Python, C-friendly core targets)
- backend control plane
- audit/parity infrastructure
- CI/CD and fixture authority

---

## 1. Protocol Layer

### Bundle shape
```json
{
  "bundle_version": "1.0.0",
  "bundle_id": "payments-prod-v12",
  "issued_at": 1700000000,
  "expires_at": 2000000000,
  "issuer": { "key_id": "axium-root-2026-01" },
  "policy": {
    "oura_version": "1.0.0",
    "rules": []
  },
  "signature": {
    "alg": "Ed25519",
    "value": "..."
  }
}
```

### Signed payload contract
The canonical signed payload excludes the `signature` object and includes exactly:
- `bundle_version`
- `bundle_id`
- `issued_at`
- `expires_at`
- `issuer`
- `policy`

### Verification modes
- `strict`
- `allowStale`
- `signatureOnly`

### Evaluation outputs
- `matched`
- `matchedRules`
- `scores.R`
- `scores.B`
- metadata such as selected priority and version

---

## 2. Client Runtime Layer

### Flutter / Dart runtime
Current structure:
- `oura_dart/lib/oura_types.dart`
- `oura_dart/lib/oura_errors.dart`
- `oura_dart/lib/oura_bundle_verifier.dart`
- `oura_dart/lib/oura_evaluator.dart`
- `oura_dart/lib/oura_engine.dart`
- `oura_dart/lib/oura_cache.dart`

### React Native runtime
Target mirrors Dart:
- shared bundle schema
- shared canonicalization
- shared fixture corpus
- shared parity artifact generation

### Python runtime
Target use cases:
- CLI verification
- backend service verification
- audit/parity runner
- offline policy debugging

### C-friendly verifier target
Target use cases:
- embedded systems
- edge verification
- firmware-safe policy checks

---

## 3. Backend / Control Plane

### Core responsibilities
- author policies
- compile policies into signed bundles
- manage trust stores
- rotate signing keys
- publish bundles to clients
- emit audit artifacts

### Suggested services
- `oura-api`: policy CRUD, bundle publishing, trust-store API
- `oura-signer`: isolated signing service using Ed25519 key material
- `oura-trust`: trust-store lifecycle and rotation service
- `oura-audit`: parity and evaluation evidence pipeline
- `oura-registry`: bundle metadata and rollout state

### Suggested stack
- API: FastAPI / Express / Go / Rust
- DB: Postgres
- Cache: Redis
- Object storage: S3-compatible bucket for bundle/trust-store artifacts
- Auth: JWT / service-to-service auth
- Audit queue: Kafka / NATS / SQS

---

## 4. Policy Authoring Layer

### Authoring model
Policies are expressed as JSON rule graphs with:
- `rule_id`
- `name`
- `priority`
- `when`
- `set`

### Expression model
- `comparison`
- `logical` with `AND` / `OR`

### Future DSL
A human-authored DSL can compile down to OURA JSON policy bundles for consistency across runtimes.

---

## 5. Trust Layer

### Current trust-store shape
```json
{
  "trusted_keys": [
    {
      "key_id": "axium-root-2026-01",
      "alg": "Ed25519",
      "public_key": "..."
    }
  ]
}
```

### Future trust-store shape (rotation-aware)
```json
{
  "version": 2,
  "trusted_keys": [
    {
      "key_id": "axium-root-2026-01",
      "alg": "Ed25519",
      "public_key": "...",
      "status": "active",
      "valid_from": 1710000000,
      "valid_to": 1730000000
    }
  ],
  "revoked_keys": []
}
```

### Required verification order
- resolve `issuer.key_id`
- reject `unknown_key`
- reject unsupported algorithms
- reject revoked / invalid-time keys (future Delta 5)
- verify Ed25519 signature
- enforce bundle expiry rules
- validate policy if mode requires it

---

## 6. Audit & Parity Layer

### Shared fixture corpus
Authoritative fixtures should exist for all runtimes:
- `trust-store.json`
- `valid-bundle.json`
- `expired-bundle.json`
- `allow-stale-bundle.json`
- `invalid-signature.json`
- `unknown-key.json`
- `invalid-policy-bundle.json`
- `local-eval-cases.json`

### Parity artifact
Each runtime should emit deterministic JSON such as:
```json
{
  "bundle_results": [],
  "evaluation_results": []
}
```

### Determinism rules
- sort bundle results by filename
- sort evaluation results by case name
- sort matched rule ids
- use explicit `null` fields where needed

---

## 7. CI/CD

### Client package CI
- format
- analyze / lint
- test
- parity artifact generation

### Merge gate expectations
- package compiles
- fixtures present
- tests pass
- parity artifact produced
- no known placeholder security behavior in protected branches

---

## 8. Security model

### Current reality
Until real Ed25519 verification lands everywhere, the runtime can claim structural parity but not cryptographic authority.

### Production requirement
Production-ready OURA requires:
- real Ed25519 verification
- real signed fixtures
- frozen canonicalization rules
- parity across Dart / RN / Python (and other runtimes)
- trust-store lifecycle handling

---

## 9. Reference flow

1. Backend authors policy
2. Policy compiled into JSON bundle
3. Signing service signs canonical payload
4. Bundle and trust store published
5. Client downloads bundle and trust store
6. Client verifies bundle
7. Client evaluates local context
8. Client returns deterministic result
9. Audit/parity pipeline records evidence

---

## 10. Full-stack target outcome

When complete, OURA provides:
- on-device policy verification
- offline-safe decisioning
- deterministic risk scoring
- cross-runtime parity
- cryptographic trust in distributed policy bundles
- future trust-store rotation and revocation support
