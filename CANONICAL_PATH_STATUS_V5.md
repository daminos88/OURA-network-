# Canonical Path Status V5

## Current strongest audit-branch path

```text
real_reserve_fetch
→ reserve_scanner_v2
→ golden_path_v4
→ gas_engine_v1
→ mev_engine_v1
→ execution_guard_v1
→ nonce_engine_v1
→ mempool_engine_v2
→ execution_retry_v1
→ calldata_tx_builder_v1
→ relay_integration_v1
→ attestation_engine_v1
→ signer_layer_v1
→ kill_switch_v1
→ live_loop_v2
→ metrics_engine
```

## Interpretation

This is the current strongest simulation-realistic, liquidity-aware, slippage-aware, gas-aware, MEV-aware, nonce-safe, relay-planned, attested, signer-ready, kill-switch-protected execution path on the audit branch.

## What is true now

- live reserve snapshots are available from chain
- liquidity-scored route objects can be built from those snapshots
- the golden path can filter candidates using reserve-aware route quality
- slippage can be modeled from reserve-backed route data
- gas cost can be applied to derive true executable profit
- MEV risk can discount profit and block high-risk execution
- execution guard can hard-block unsafe paths
- nonce reservation can allocate deterministic sequence positions
- mempool strategy can choose public / private / bundle mode
- retry policy can react to relay reject / timeout / replacement / nonce conflict
- calldata-level transaction plans can be produced
- relay dispatch plans can be synthesized without custody
- attestation envelopes and replay proofs can be produced
- signer requests can be built for external signing without key storage
- kill switch can hard-stop execution under unsafe conditions
- repeated runtime simulation exists
- metrics and telemetry exist

## What is still pending before fuller production realism

- real relay endpoint wiring
- secure signer infra / HSM hookup
- deployment monitoring / alerting
- stricter deterministic replay / ops tooling

## Canonical guidance

- Prefer the audit-branch V4/V5 path over earlier V2/V3 variants.
- Treat legacy modules as historical references unless explicitly promoted.
- New work should extend the current strongest audit-branch path rather than create parallel paths.
