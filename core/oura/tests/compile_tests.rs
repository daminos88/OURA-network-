use oura::compile_oura;
use oura::ir::Decision;

#[test]
fn compiles_basic_rule() {
    let src = r#"
rule degrade_service {
  when:
    Δtrust < -0.2
    and pressure > 3
  then:
    reduce_traffic
}
"#;

    let rules = compile_oura(src).unwrap();
    assert_eq!(rules.len(), 1);
    assert_eq!(rules[0].name, "degrade_service");
    assert_eq!(rules[0].action, Decision::ReduceTraffic);
    assert!(!rules[0].requires_quorum);
}

#[test]
fn compiles_threshold_operand_rule() {
    let src = r#"
rule cpu_pressure {
  when:
    pressure > Θ.cpu
  then:
    reduce_traffic
}
"#;

    let rules = compile_oura(src).unwrap();
    assert_eq!(rules.len(), 1);
}

#[test]
fn compiles_quorum_rule() {
    let src = r#"
rule critical_failure {
  when:
    risk > 0.8
    and Δtrust < -0.3
  then:
    isolate quorum
}
"#;

    let rules = compile_oura(src).unwrap();
    assert!(rules[0].requires_quorum);
    assert_eq!(rules[0].priority, 0);
}

#[test]
fn preserves_rule_order_as_priority() {
    let src = r#"
rule first_rule {
  when:
    pressure > 1
  then:
    warn
}

rule second_rule {
  when:
    pressure > 2
  then:
    isolate quorum
}
"#;

    let rules = compile_oura(src).unwrap();
    assert_eq!(rules[0].name, "first_rule");
    assert_eq!(rules[0].priority, 0);
    assert_eq!(rules[1].name, "second_rule");
    assert_eq!(rules[1].priority, 1);
}
