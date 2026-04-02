use std::collections::HashSet;

use crate::ast::*;

pub fn validate(program: &AstProgram) -> Result<(), String> {
    let mut seen = HashSet::new();

    for rule in &program.rules {
        if !seen.insert(rule.name.clone()) {
            return Err(format!("duplicate rule name '{}'", rule.name));
        }

        if rule.when.is_empty() {
            return Err(format!("rule '{}' has no conditions", rule.name));
        }

        if !rule.name.chars().all(|c| c.is_ascii_alphanumeric() || c == '_') {
            return Err(format!("rule '{}' has invalid name", rule.name));
        }

        if rule.then.quorum {
            match rule.then.action {
                AstAction::Isolate => {}
                _ => {
                    return Err(format!(
                        "rule '{}' uses quorum with unsupported action {:?}",
                        rule.name, rule.then.action
                    ));
                }
            }
        }

        for cond in &rule.when {
            match &cond.metric {
                AstMetric::Threshold(name) if name.is_empty() => {
                    return Err(format!("rule '{}' has empty left threshold name", rule.name));
                }
                _ => {}
            }

            match &cond.operand {
                AstOperand::Number(v) if !v.is_finite() => {
                    return Err(format!("rule '{}' has non-finite numeric operand", rule.name));
                }
                AstOperand::Threshold(name) if name.is_empty() => {
                    return Err(format!("rule '{}' has empty right threshold name", rule.name));
                }
                _ => {}
            }
        }
    }

    Ok(())
}
