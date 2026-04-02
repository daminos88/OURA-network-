# OURA V1 Acceptance Checklist

## Purpose

This checklist is the final closure gate for the OURA V1 subproject.

OURA V1 is considered complete only when every required item below is verified.

This checklist exists to prevent semantic drift and to ensure the language/runtime is finished as a standalone subproject before any broader AXIUM wiring, emitters, or platform integrations continue.

---

## Scope of OURA V1

### In scope

- grammar
- lexer
- parser
- AST
- validator
- IR
- lowering
- runtime context
- evaluator
- tests
- examples / fixtures
- specification docs

### Out of scope

- supervisor wiring
- NATS integration
- Postgres integration
- Flutter / React / Python emitters
- learning / optimization
- distributed coordination
- UI / editor
- agent planning

---

## Canonical Ownership

### Source of truth

The canonical OURA V1 implementation must live in:

- `core/oura`
- `core/oura-runtime`

### Downstream / reference only

Any Dart verifier / runtime work is downstream reference only.

It may inform:

- fixtures
- verifier semantics
- future portable consumers

It must **not** define canonical grammar, AST, IR, or evaluator behavior.

---

## Repository Shape

### Required structure

- [ ] `core/oura/Cargo.toml` exists
- [ ] `core/oura/src/lib.rs` exists
- [ ] `core/oura/src/ast.rs` exists
- [ ] `core/oura/src/ir.rs` exists
- [ ] `core/oura/src/lexer.rs` exists
- [ ] `core/oura/src/parser.rs` exists
- [ ] `core/oura/src/validate.rs` exists
- [ ] `core/oura/src/lower.rs` exists
- [ ] `core/oura-runtime/Cargo.toml` exists
- [ ] `core/oura-runtime/src/lib.rs` exists
- [ ] `core/oura-runtime/src/context.rs` exists
- [ ] `core/oura-runtime/src/evaluator.rs` exists
- [ ] `docs/oura-v1-spec.md` exists
- [ ] `examples/` contains canonical OURA fixtures

---

## Compiler Acceptance

### Public compiler contract

- [ ] `compile_oura(source: &str) -> Result<Vec<Rule>, String>` exists
- [ ] valid `.oura` input compiles into IR successfully
- [ ] invalid `.oura` input fails with an error

### Grammar support

- [ ] rule blocks compile correctly
- [ ] `when:` blocks compile correctly
- [ ] `then:` blocks compile correctly
- [ ] multiple `and` conditions compile correctly
- [ ] action parsing works for all V1 actions
- [ ] optional `quorum` parsing works correctly

### Metric support

- [ ] normal metrics compile (`trust`, `pressure`, `risk`, `latency`, `error_rate`)
- [ ] delta metrics compile (`Δtrust`, `Δpressure`, `Δrisk`, `Δlatency`, `Δerror_rate`)
- [ ] threshold fields compile (`Θ.cpu`, `Θ.max_risk`, etc.)

### Operand support

- [ ] numeric operands compile
- [ ] threshold operands compile
- [ ] rules like `pressure > Θ.cpu` compile correctly

### Structural guarantees

- [ ] duplicate rule names are rejected
- [ ] empty program is rejected
- [ ] malformed threshold syntax is rejected
- [ ] malformed delta syntax is rejected
- [ ] invalid actions are rejected
- [ ] invalid operator syntax is rejected
- [ ] unsupported quorum combinations are rejected

---

## AST / IR Acceptance

### AST

- [ ] AST preserves rule order
- [ ] AST preserves source rule names
- [ ] AST preserves quorum flag
- [ ] AST preserves metric/operator/operand structure

### IR

- [ ] AST lowers cleanly into IR
- [ ] IR contains normalized `Decision`
- [ ] IR contains normalized `Metric`
- [ ] IR contains normalized `Operand`
- [ ] IR assigns deterministic priority from source order

---

## Runtime Evaluator Acceptance

### Public runtime contract

- [ ] `evaluate_rules(rules, ctx) -> Result<EvaluationResult, String>` exists
- [ ] evaluation result contains `decision`
- [ ] evaluation result contains `matched_rule`
- [ ] evaluation result contains `requires_quorum`

### Determinism

- [ ] same rules + same context always produce same decision
- [ ] evaluation is side-effect free
- [ ] runtime does not mutate infrastructure or external state

### Evaluation model

- [ ] first-match-wins is implemented
- [ ] no-match returns `NoOp`
- [ ] later rules are ignored after the first match

### Context support

- [ ] trust resolves correctly
- [ ] pressure resolves correctly
- [ ] risk resolves correctly
- [ ] latency resolves correctly
- [ ] error rate resolves correctly
- [ ] delta values resolve correctly
- [ ] threshold values resolve correctly

### Threshold behavior

- [ ] threshold operands resolve from runtime context
- [ ] missing threshold returns an error
- [ ] evaluator fails closed when threshold data is missing

### Quorum behavior

- [ ] `quorum` survives compile → lower → evaluate
- [ ] matching quorum rule returns `requires_quorum = true`
- [ ] non-quorum rules return `requires_quorum = false`

---

## Test Suite Acceptance

### Compiler tests

- [ ] valid rule compilation test exists
- [ ] threshold operand compilation test exists
- [ ] quorum syntax compilation test exists
- [ ] rule priority preservation test exists

### Invalid tests

- [ ] missing `then` test exists
- [ ] bad action test exists
- [ ] duplicate rule name test exists
- [ ] bad quorum action test exists
- [ ] empty program test exists

### Runtime tests

- [ ] first-match-wins test exists
- [ ] no-match returns `NoOp` test exists
- [ ] threshold lookup success test exists
- [ ] missing threshold failure test exists
- [ ] delta-based rule test exists
- [ ] quorum-preservation test exists

### Test results

- [ ] all compiler tests pass
- [ ] all invalid tests pass
- [ ] all runtime evaluator tests pass

---

## Fixture / Example Acceptance

### Required valid fixtures

- [ ] `examples/basic.oura` exists
- [ ] `examples/thresholds.oura` exists
- [ ] `examples/recovery.oura` exists

### Required invalid fixtures

- [ ] `examples/invalid_missing_then.oura` exists
- [ ] `examples/invalid_bad_action.oura` exists
- [ ] `examples/invalid_duplicate_rule.oura` exists
- [ ] `examples/invalid_bad_quorum.oura` exists

### Fixture behavior

- [ ] valid fixtures compile successfully
- [ ] invalid fixtures fail as expected
- [ ] fixtures match the canonical spec examples

---

## Documentation Acceptance

### Spec completeness

- [ ] `docs/oura-v1-spec.md` exists
- [ ] grammar is documented
- [ ] lexical rules are documented
- [ ] AST model is documented
- [ ] IR model is documented
- [ ] compilation pipeline is documented
- [ ] evaluation semantics are documented
- [ ] quorum semantics are documented
- [ ] threshold semantics are documented
- [ ] non-goals are explicitly documented

### Documentation alignment

- [ ] docs match compiler implementation
- [ ] docs match evaluator behavior
- [ ] docs match fixtures/examples
- [ ] docs match tests

---

## Non-Goals Lock

The following must remain out of OURA V1:

- [ ] no `or`
- [ ] no `not`
- [ ] no parentheses / nested boolean expressions
- [ ] no execution logic
- [ ] no event emission
- [ ] no retry / backoff logic
- [ ] no distributed coordination
- [ ] no multi-language emitters
- [ ] no learning / optimization
- [ ] no UI/editor features
- [ ] no agent planning

---

## Final Closure Gate

OURA V1 is closed only when all of the following are true:

- [ ] compiler builds cleanly
- [ ] runtime builds cleanly
- [ ] valid `.oura` examples compile
- [ ] invalid `.oura` examples fail correctly
- [ ] evaluator is deterministic
- [ ] threshold operands work
- [ ] delta metrics work
- [ ] quorum flags survive compile + evaluation
- [ ] tests pass
- [ ] docs match implementation
- [ ] canonical ownership is respected (`core/oura` and `core/oura-runtime`)

If any one of the above fails, OURA V1 remains open.
