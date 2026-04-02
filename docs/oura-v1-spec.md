# OURA V1 Specification

## Status

Locked V1

## Purpose

OURA is a declarative control language for expressing how systems should respond to changing conditions.

OURA does **not** execute actions itself. It produces deterministic decisions that are later consumed by a separate runtime/execution system.

In OURA V1, the language is intentionally minimal:

- deterministic
- parser-friendly
- compact
- delta-aware
- safe to validate

---

## Design Philosophy

OURA describes:

- current system state
- changes in system state
- threshold-based limits
- allowed response

OURA does **not** describe:

- execution steps
- event emission
- retries
- distributed coordination
- infrastructure mutation

### Core model

OURA V1 centers on four symbolic concepts:

- `Δ` = change / delta
- `Σ` = pressure / load (represented in V1 as normal field names like `pressure`)
- `Θ` = threshold references
- `Ω` = risk / exposure (represented in V1 as normal field names like `risk`)

In V1, only `Δ` and `Θ` are explicit syntax forms. `pressure` and `risk` remain regular named metrics.

---

## File Format

Suggested extension:

```text
.oura
```

---

## Grammar

### EBNF

```ebnf
Program        ::= { Rule }

Rule           ::= "rule" Identifier "{" WhenBlock ThenBlock "}"

WhenBlock      ::= "when:" Condition { "and" Condition }

ThenBlock      ::= "then:" Action [ "quorum" ]

Condition      ::= Metric Operator Operand

Metric         ::= Field
                 | DeltaField
                 | ThresholdField

Operand        ::= Number
                 | ThresholdField

Field          ::= "trust"
                 | "pressure"
                 | "risk"
                 | "latency"
                 | "error_rate"

DeltaField     ::= "Δ" Field

ThresholdField ::= "Θ." Identifier

Operator       ::= "<" | "<=" | ">" | ">=" | "==" | "!="

Action         ::= "noop"
                 | "warn"
                 | "reduce_traffic"
                 | "rotate"
                 | "isolate"
                 | "rejoin"
```

---

## Valid Examples

### Basic degradation

```oura
rule degrade_service {
  when:
    Δtrust < -0.2
    and pressure > 3
  then:
    reduce_traffic
}
```

### Critical failure

```oura
rule critical_failure {
  when:
    risk > 0.8
    and Δtrust < -0.3
  then:
    isolate quorum
}
```

### Recovery

```oura
rule recovery {
  when:
    Δtrust > 0.2
    and risk < 0.4
  then:
    rejoin
}
```

### Threshold operand

```oura
rule cpu_pressure {
  when:
    pressure > Θ.cpu
  then:
    reduce_traffic
}
```

---

## Evaluation Semantics

- rules are evaluated in source order
- first match wins
- if no rule matches, the result is `NoOp`
- `quorum` is preserved as metadata only
- thresholds are resolved from runtime context
- missing thresholds fail closed with an error

---

## Canonical Ownership

The canonical OURA V1 source of truth is:

- `core/oura`
- `core/oura-runtime`

Any Dart verifier/runtime work is downstream/reference only and may not define canonical grammar, AST, IR, or evaluator semantics.

---

## Non-Goals

OURA V1 does **not** include:

- `or`
- `not`
- parentheses
- nested boolean expressions
- execution logic
- event emission
- retries / backoff
- distributed coordination
- multi-language emitters
- learning / optimization
- UI/editor features
- agent planning
