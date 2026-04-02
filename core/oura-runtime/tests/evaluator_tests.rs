use oura::compile_oura;
use oura_runtime::{evaluate_rules, EvaluationContext};

#[test]
fn first_match_wins() {
    let src = r#"
rule first {
  when:
    pressure > 1
  then:
    warn
}

rule second {
  when:
    pressure > 0
  then:
    isolate quorum
}
"#;

    let rules = compile_oura(src).unwrap();

    let mut ctx = EvaluationContext::default();
    ctx.pressure = 5.0;

    let result = evaluate_rules(&rules, &ctx).unwrap();

    assert_eq!(format!("{:?}", result.decision), "Warn");
    assert_eq!(result.matched_rule.unwrap(), "first");
}

#[test]
fn no_match_returns_noop() {
    let src = r#"
rule only_rule {
  when:
    pressure > 10
  then:
    warn
}
"#;

    let rules = compile_oura(src).unwrap();
    let ctx = EvaluationContext::default();

    let result = evaluate_rules(&rules, &ctx).unwrap();

    assert_eq!(format!("{:?}", result.decision), "NoOp");
    assert!(result.matched_rule.is_none());
}

#[test]
fn threshold_lookup() {
    let src = r#"
rule cpu {
  when:
    pressure > Θ.cpu
  then:
    reduce_traffic
}
"#;

    let rules = compile_oura(src).unwrap();

    let mut ctx = EvaluationContext::default();
    ctx.pressure = 5.0;
    ctx.thresholds.insert("cpu".into(), 3.0);

    let result = evaluate_rules(&rules, &ctx).unwrap();

    assert_eq!(format!("{:?}", result.decision), "ReduceTraffic");
}

#[test]
fn missing_threshold_fails() {
    let src = r#"
rule cpu {
  when:
    pressure > Θ.cpu
  then:
    reduce_traffic
}
"#;

    let rules = compile_oura(src).unwrap();
    let ctx = EvaluationContext::default();

    assert!(evaluate_rules(&rules, &ctx).is_err());
}
