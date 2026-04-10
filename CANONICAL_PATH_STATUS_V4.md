# Canonical Path Status V4

## Current strongest audit-branch path

```text
real_reserve_fetch
→ reserve_scanner_v2
→ golden_path_v4
→ gas_engine_v1
→ mev_engine_v1
→ execution_guard_v1
→ nonce_engine_v1
→ live_loop_v2
→ metrics_engine
```

## Interpretation

This is the current strongest simulation-realistic, liquidity-aware, slippage-aware, gas-aware, and MEV-aware path on the audit branch.

## What is true now

- live reserve snapshots are available from chain
- liquidity-scored route objects can be built from those snapshots
- the golden path can filter candidates using reserve-aware route quality
- slippage can be modeled from reserve-backed route data
- gas cost can be applied to derive true executable profit
- MEV risk can discount profit and block high-risk execution
- execution guard can hard-block unsafe paths
- nonce reservation can allocate deterministic sequence positions
- repeated runtime simulation exists
- metrics and telemetry exist

## What is still pending before fuller production realism

- mempool / private tx strategy
- execution fallback / retry policy
- stricter ABI-level calldata realism
- tamper-evident governance ledger
- deeper latency / inclusion modeling

## Canonical guidance

- Prefer the audit-branch V4 path over earlier V2/V3 path variants.
- Treat legacy modules as historical references unless explicitly promoted.
- New work should extend the current strongest audit-branch path rather than create parallel paths.
