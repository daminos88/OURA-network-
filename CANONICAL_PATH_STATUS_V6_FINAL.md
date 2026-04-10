# Canonical Path Status V6

## Current strongest audit-branch path

real_reserve_fetch
→ reserve_scanner_v2
→ golden_path_v4
→ gas_feed_v1
→ gas_engine_v1
→ mev_engine_v1
→ oura_engine_v4
→ execution_guard_v1
→ nonce_engine_v1
→ mempool_engine_v2
→ execution_retry_v1
→ calldata_tx_builder_v1
→ relay_integration_v1
→ relay_wiring_v1
→ attestation_engine_v1
→ signer_layer_v1
→ kill_switch_v1
→ live_loop_v5
→ metrics_persistence_v1
→ ci_replay_runner_v2

## Interpretation

This is the current strongest deterministic, field-based, gas-aware, relay-aware, signer-ready, kill-switch-protected execution path on the audit branch.

## Canonical guidance

Prefer this path over all earlier versions.
