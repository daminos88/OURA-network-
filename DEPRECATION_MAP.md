# Deprecation Map (Audit Branch)

The following modules are retained for reference but are **non-canonical** and should not be used for new development:

## Scanner (legacy)
- `src/core/router_quote.js`
- `src/core/size_scanner.js`

## Hybrid orchestrators (legacy)
- `src/core/hybrid_orchestrator.js`
- `src/core/hybrid_orchestrator_v2.js`

## Execution (legacy)
- `src/core/execution_engine.js`

## Notes

- These modules remain in the repo for historical comparison and testing.
- All new work must target the V2+ stack and `golden_path.js`.
- Removal can be considered after full validation on the audit branch.
