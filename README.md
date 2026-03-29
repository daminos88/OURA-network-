# OURA Network

OURA is a cross-runtime verified policy system focused on deterministic bundle verification, trust-store validation, and portable policy evaluation.

## Current repository focus

This repository is being rebuilt around four core layers:

- **Runtime verification**: verify signed policy bundles against a trust store
- **Policy evaluation**: evaluate policy rules deterministically and return risk scores
- **Trust lifecycle**: support key validation, expiry handling, and future rotation/revocation
- **Cross-runtime parity**: keep Flutter/Dart, Python, and React Native aligned on the same protocol semantics

## Repository layout

```text
oura_dart/          Dart runtime and tests
oura_python/        Python runtime and parity work
oura_react_native/  React Native runtime work
test/fixtures/      Shared fixtures for trust store and bundles
.github/            CI and automation workflows
```

## OURA Dart runtime

The Dart runtime is responsible for:

- loading a signed bundle
- verifying it against a trust store
- handling verification modes such as strict and allow-stale
- evaluating the embedded policy against caller context

## Trust model

OURA verification depends on:

- canonical signed payload extraction
- deterministic JSON canonicalization
- Ed25519 signature verification
- trust-store key lookup
- bundle expiry checks

## Current status

The repository is mid-hardening. Some follow-up work is still expected, including:

- restoring missing repo files after an accidental destructive merge
- re-establishing CI workflows
- restoring shared fixtures where missing
- replacing placeholder cryptographic verification with fully enforced Ed25519 verification across runtimes
- parity validation across runtimes

## Goal

The end state for OURA is:

> one policy bundle, one trust store, one protocol truth, across every supported runtime.
