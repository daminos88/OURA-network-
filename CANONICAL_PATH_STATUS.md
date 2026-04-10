# Canonical Path Status

## Current strongest audit-branch path

```text
real_reserve_fetch
→ reserve_scanner_v2
→ golden_path_v3
→ slippage_engine_v2
→ live_loop_v2
→ metrics_engine
```

## Interpretation

This is the current strongest simulation-realistic, liquidity-aware, on-chain-truth-backed path on the audit branch.

## What is true now

- live reserve snapshots are available from chain
- liquidity-scored route objects can be built from those snapshots
- golden path can filter candidates using reserve-aware route quality
- slippage can be modeled from reserve-backed route data
- repeated runtime simulation exists
- metrics/telemetry exist

## What is still pending before full production realism

- gas + fee model
- latency / MEV awareness
- nonce / mempool strategy
- stricter ABI-level calldata realism
- tamper-evident governance ledger

## Canonical guidance

- Prefer the audit-branch V2/V3/V4-era files over legacy modules.
- Treat legacy modules as historical references unless explicitly promoted.
- New work should extend the current strongest audit-branch path rather than create parallel paths.
