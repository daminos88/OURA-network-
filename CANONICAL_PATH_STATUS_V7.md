# CANONICAL PATH STATUS — V7

## Status
FINAL — TESTNET READY

## Canonical Runtime Path

live_loop_v6
→ orchestrated_execution_v5d
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
→ metrics_persistence_v1
→ ci_replay_runner_v2

## Guarantees
- signer gating enforced
- OURA routing differentiated (ACCEPT / DECAY / CONTAMINATED)
- retry system neutral until real failure
- nonce consistency enforced into kill switch
- kill switch wired to real system state

## Notes
All prior versions are considered historical.
This path is the only supported execution path for testnet.
