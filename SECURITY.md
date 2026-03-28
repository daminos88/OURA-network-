# SECURITY POLICY

## Overview
OURA enforces a deterministic trust model across multiple runtimes (Flutter and React Native).

Security is based on:
- Canonical payload hashing
- Ed25519 signature verification
- Trusted key store validation

## Trust Model
- All bundles MUST be signed
- Only trusted keys from `trust-store.json` are accepted
- Verification MUST be deterministic across runtimes

## Current State
- Crypto pipeline is implemented (structure)
- Real Ed25519 backend integration is pending
- Shared fixtures are pending

## Requirements Before Production
- Real Ed25519 verification enabled in all runtimes
- Shared fixtures present under `test/fixtures/`
- CI parity validation passing across runtimes

## Reporting
If you discover a vulnerability, report it via GitHub Issues.

## Notes
Do NOT introduce fake or placeholder cryptographic validation in production code.
