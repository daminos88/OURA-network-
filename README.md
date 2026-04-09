# AXIUM / OURA Network

AXIUM / OURA Network is a deterministic, non-custodial, simulation-grade market intelligence and execution-preparation core.

It is designed to:
- scan market opportunities
- rank and risk-filter candidate signals
- model execution deterministically
- build route and transaction plans
- record an auditable decision trail
- run repeated simulation loops through a single canonical path

## Canonical path

The official path in this repository is:

```text
Scanner V2
→ Divergence
→ Signal Ranker
→ Risk Engine
→ Execution Engine V2
→ Route Builder
→ TX Builder
→ Audit Ledger
→ Golden Path
→ Live Loop
→ Metrics Engine
```

## What this repo is

This repo is a **non-custodial simulation / decision core**.

It includes:
- deterministic scanners
- deterministic ranking and risk gating
- execution modeling
- route planning
- transaction-plan building
- audit logging
- canonical live-loop simulation
- metrics and telemetry

## What this repo is not

This repo does **not** include:
- private key storage
- signer integration
- live transaction broadcast
- capital custody

That is intentional.

## Current status

The repository now contains a canonical deterministic path and a canonical repeated simulation harness.

Main areas implemented:
- `src/core/router_quote_v2.js`
- `src/core/size_scanner_v2.js`
- `src/core/price_compare.js`
- `src/core/signal_ranker.js`
- `src/core/risk_engine.js`
- `src/core/execution_engine_v2.js`
- `src/core/route_builder.js`
- `src/core/tx_builder.js`
- `src/core/audit_ledger.js`
- `src/core/golden_path.js`
- `src/core/live_loop.js`
- `src/core/metrics_engine.js`

## Quick probes

Examples:

```bash
node src/demo/scanner_v2_probe.js
node src/demo/golden_path_probe.js
node src/demo/live_loop_probe.js
node src/demo/metrics_engine_probe.js
```

## Branch model

- `main` = public/default branch
- `audit/golden-path-consolidation` = consolidation branch for canonical-path cleanup and documentation

## Audit branch additions

The audit branch includes:
- `ARCHITECTURE.md`
- `DEPRECATION_MAP.md`
- canonical `live_loop` bound to `golden_path`
- metrics engine
- this README

## Safety boundary

This repository is intentionally safe by default.

It is built for:
- deterministic simulation
- research
- architecture validation
- auditability

It is not a live-capital signer or broadcast system.
