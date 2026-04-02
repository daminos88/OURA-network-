use oura::compile_oura;

#[test]
fn fails_missing_then() {
    let src = r#"
rule broken {
  when:
    trust < 0.5
}
"#;

    assert!(compile_oura(src).is_err());
}

#[test]
fn fails_duplicate_rule_name() {
    let src = r#"
rule same {
  when:
    trust < 0.5
  then:
    warn
}

rule same {
  when:
    trust < 0.4
  then:
    isolate quorum
}
"#;

    assert!(compile_oura(src).is_err());
}

#[test]
fn fails_bad_quorum_action() {
    let src = r#"
rule bad_quorum {
  when:
    trust < 0.5
  then:
    warn quorum
}
"#;

    assert!(compile_oura(src).is_err());
}
