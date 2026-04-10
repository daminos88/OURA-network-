# AXIUM / OURA Network — Canonical Architecture

## Canonical path

The official deterministic execution-preparable path in this repository is:

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
```

## Canonical modules

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

## Canonical probes

- `src/demo/scanner_v2_probe.js`
- `src/demo/signal_ranker_probe.js`
- `src/demo/risk_engine_probe.js`
- `src/demo/execution_engine_v2_probe.js`
- `src/demo/route_builder_probe.js`
- `src/demo/tx_builder_probe.js`
- `src/demo/golden_path_probe.js`

## Design rule

New work should integrate into the canonical path unless there is a clear reason to add a temporary sidecar. Sidecars must either be promoted or explicitly marked non-canonical.
